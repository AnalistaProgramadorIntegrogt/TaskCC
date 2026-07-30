-- 1. Create public.proyectos
CREATE TABLE IF NOT EXISTS public.proyectos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  descripcion text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Generic updated_at trigger for proyectos
DROP TRIGGER IF EXISTS trg_proyectos_updated_at ON public.proyectos;
CREATE TRIGGER trg_proyectos_updated_at BEFORE UPDATE ON public.proyectos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Extend public.grupos with proyecto_id
ALTER TABLE public.grupos
  ADD COLUMN IF NOT EXISTS proyecto_id bigint REFERENCES public.proyectos(id);

-- 3. Extend public.checklists with proyecto_id
ALTER TABLE public.checklists
  ADD COLUMN IF NOT EXISTS proyecto_id bigint REFERENCES public.proyectos(id);

-- Since existing checklists and grupos don't have a proyecto, we create a default project and assign it
INSERT INTO public.proyectos (nombre, descripcion)
SELECT 'Proyecto General', 'Proyecto generado automáticamente en la migración'
WHERE NOT EXISTS (SELECT 1 FROM public.proyectos);

-- Assign default project to existing grupos and checklists
DO $$
DECLARE
  v_default_proyecto_id bigint;
BEGIN
  SELECT id INTO v_default_proyecto_id FROM public.proyectos LIMIT 1;
  
  UPDATE public.grupos SET proyecto_id = v_default_proyecto_id WHERE proyecto_id IS NULL;
  UPDATE public.checklists SET proyecto_id = v_default_proyecto_id WHERE proyecto_id IS NULL;
END $$;

-- Make columns NOT NULL
ALTER TABLE public.grupos ALTER COLUMN proyecto_id SET NOT NULL;
ALTER TABLE public.checklists ALTER COLUMN proyecto_id SET NOT NULL;

-- 4. Update constraints
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS checklists_colab_fecha_key;
ALTER TABLE public.checklists ADD CONSTRAINT checklists_colab_fecha_proyecto_key UNIQUE (colaborador_asignado_id, fecha, proyecto_id);

-- 5. Update generating function
CREATE OR REPLACE FUNCTION public.generar_checklists_para_fecha(
    p_fecha date DEFAULT CURRENT_DATE
)
RETURNS integer
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted_tasks int := 0;
  v_row record;
  v_checklist_id bigint;
BEGIN
  -- Iterate through all valid group-collaborator assignments for the given date
  FOR v_row IN 
    SELECT 
      gc.colaborador_id,
      g.id as grupo_id,
      g.nombre as grupo_nombre,
      g.proyecto_id
    FROM public.grupos g
    JOIN public.grupo_colaboradores gc ON g.id = gc.grupo_id
    WHERE g.activo = true 
      AND gc.activo = true
      AND p_fecha >= g.fecha_inicio
      AND (g.fecha_fin IS NULL OR p_fecha <= g.fecha_fin)
      AND p_fecha >= gc.fecha_inicio
      AND (gc.fecha_fin IS NULL OR p_fecha <= gc.fecha_fin)
      AND g.recurrencia_tipo IS NOT NULL
      AND (
        (g.recurrencia_tipo = 'semanal' AND EXTRACT(ISODOW FROM p_fecha) = g.dia_semana)
        OR
        (g.recurrencia_tipo = 'mensual' AND EXTRACT(DAY FROM p_fecha) = g.dia_mes AND (
          (EXTRACT(YEAR FROM p_fecha) * 12 + EXTRACT(MONTH FROM p_fecha)) - 
          (EXTRACT(YEAR FROM g.fecha_inicio) * 12 + EXTRACT(MONTH FROM g.fecha_inicio))
        ) % g.intervalo_meses = 0)
      )
  LOOP
    -- Ensure checklist exists for this collaborator, date, and project
    INSERT INTO public.checklists (colaborador_asignado_id, fecha, proyecto_id)
    VALUES (v_row.colaborador_id, p_fecha, v_row.proyecto_id)
    ON CONFLICT (colaborador_asignado_id, fecha, proyecto_id) DO NOTHING;
    
    SELECT id INTO v_checklist_id
    FROM public.checklists
    WHERE colaborador_asignado_id = v_row.colaborador_id AND fecha = p_fecha AND proyecto_id = v_row.proyecto_id;

    -- Insert tasks
    WITH inserted AS (
      INSERT INTO public.checklist_tareas (checklist_id, grupo_id, tarea_id, tarea_nombre_snapshot, grupo_nombre_snapshot)
      SELECT 
        v_checklist_id,
        v_row.grupo_id,
        tr.tarea_id,
        t.nombre,
        v_row.grupo_nombre
      FROM public.tareas_recurrentes tr
      JOIN public.tareas t ON tr.tarea_id = t.id
      WHERE tr.grupo_id = v_row.grupo_id AND t.activa = true
      ON CONFLICT (checklist_id, grupo_id, tarea_id) WHERE grupo_id IS NOT NULL DO NOTHING
      RETURNING 1
    )
    SELECT v_inserted_tasks + count(*) INTO v_inserted_tasks FROM inserted;

  END LOOP;

  RETURN v_inserted_tasks;
END;
$$ LANGUAGE plpgsql;

-- 6. Update BI View
DROP VIEW IF EXISTS public.vw_historial_tareas;
CREATE OR REPLACE VIEW public.vw_historial_tareas AS
SELECT 
    ct.id AS checklist_tarea_id,
    c.id AS checklist_id,
    c.proyecto_id,
    p.nombre AS proyecto_nombre,
    c.fecha,
    EXTRACT(YEAR FROM c.fecha)::int AS anio,
    EXTRACT(MONTH FROM c.fecha)::int AS mes,
    EXTRACT(WEEK FROM c.fecha)::int AS semana_iso,
    EXTRACT(ISODOW FROM c.fecha)::int AS dia_semana_numero,
    c.dia AS dia_semana_nombre,
    c.colaborador_asignado_id,
    ca.nombre AS colaborador_asignado,
    ca.rol_id,
    r.rol,
    ct.colaborador_resuelve_id,
    cr.nombre AS colaborador_resuelve,
    ct.grupo_id,
    COALESCE(ct.grupo_nombre_snapshot, g.nombre, 'Tarea individual') AS grupo,
    ct.tarea_id,
    COALESCE(ct.tarea_nombre_snapshot, t.nombre) AS tarea,
    ct.completada,
    CASE 
      WHEN ct.completada = true THEN 'Completada'
      WHEN ct.completada = false AND c.fecha < CURRENT_DATE THEN 'No realizada'
      ELSE 'Pendiente'
    END AS estado,
    ct.completada_at,
    ct.observaciones,
    ct.foto_url,
    ct.foto_path
FROM public.checklist_tareas ct
JOIN public.checklists c ON ct.checklist_id = c.id
LEFT JOIN public.proyectos p ON c.proyecto_id = p.id
JOIN public.colaboradores ca ON c.colaborador_asignado_id = ca.id
JOIN public.roles r ON ca.rol_id = r.id
LEFT JOIN public.colaboradores cr ON ct.colaborador_resuelve_id = cr.id
LEFT JOIN public.grupos g ON ct.grupo_id = g.id
LEFT JOIN public.tareas t ON ct.tarea_id = t.id;
