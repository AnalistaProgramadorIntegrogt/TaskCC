-- 1. Extend public.grupos
ALTER TABLE public.grupos
  ADD COLUMN IF NOT EXISTS recurrencia_tipo text CHECK (recurrencia_tipo IN ('semanal', 'mensual') OR recurrencia_tipo IS NULL),
  ADD COLUMN IF NOT EXISTS dia_semana smallint CHECK (dia_semana BETWEEN 1 AND 7),
  ADD COLUMN IF NOT EXISTS dia_mes smallint CHECK (dia_mes BETWEEN 1 AND 31),
  ADD COLUMN IF NOT EXISTS intervalo_meses smallint NOT NULL DEFAULT 1 CHECK (intervalo_meses > 0),
  ADD COLUMN IF NOT EXISTS fecha_inicio date,
  ADD COLUMN IF NOT EXISTS fecha_fin date;

-- Backfill fecha_inicio for existing groups
UPDATE public.grupos
SET fecha_inicio = COALESCE(created_at::date, CURRENT_DATE)
WHERE fecha_inicio IS NULL;

-- Enforce constraints
ALTER TABLE public.grupos
  DROP CONSTRAINT IF EXISTS chk_grupos_fecha_fin,
  DROP CONSTRAINT IF EXISTS chk_grupos_semanal,
  DROP CONSTRAINT IF EXISTS chk_grupos_mensual;

ALTER TABLE public.grupos
  ADD CONSTRAINT chk_grupos_fecha_fin CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
  ADD CONSTRAINT chk_grupos_semanal CHECK (
    (recurrencia_tipo = 'semanal' AND dia_semana IS NOT NULL AND dia_mes IS NULL) OR
    (recurrencia_tipo != 'semanal' OR recurrencia_tipo IS NULL)
  ),
  ADD CONSTRAINT chk_grupos_mensual CHECK (
    (recurrencia_tipo = 'mensual' AND dia_mes IS NOT NULL AND dia_semana IS NULL) OR
    (recurrencia_tipo != 'mensual' OR recurrencia_tipo IS NULL)
  );

-- 2. Create public.grupo_colaboradores
CREATE TABLE IF NOT EXISTS public.grupo_colaboradores (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  grupo_id bigint NOT NULL REFERENCES public.grupos(id),
  colaborador_id bigint NOT NULL REFERENCES public.colaboradores(id),
  fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin date,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_grupo_colab_fecha_fin CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_grupo_colaboradores_unique_activo 
  ON public.grupo_colaboradores (grupo_id, colaborador_id) 
  WHERE activo = true;

-- Enable RLS for grupo_colaboradores
ALTER TABLE public.grupo_colaboradores ENABLE ROW LEVEL SECURITY;

-- 3. Extend public.checklist_tareas
ALTER TABLE public.checklist_tareas
  ADD COLUMN IF NOT EXISTS grupo_id bigint REFERENCES public.grupos(id),
  ADD COLUMN IF NOT EXISTS tarea_nombre_snapshot text,
  ADD COLUMN IF NOT EXISTS grupo_nombre_snapshot text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill tarea_nombre_snapshot for existing records (no need to backfill grupo_id since legacy is null)
UPDATE public.checklist_tareas ct
SET tarea_nombre_snapshot = t.nombre
FROM public.tareas t
WHERE ct.tarea_id = t.id AND ct.tarea_nombre_snapshot IS NULL;

-- 4. Duplicate protection
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS checklists_colab_fecha_key;
ALTER TABLE public.checklists ADD CONSTRAINT checklists_colab_fecha_key UNIQUE (colaborador_asignado_id, fecha);

ALTER TABLE public.tareas_recurrentes DROP CONSTRAINT IF EXISTS tareas_recurrentes_grupo_tarea_key;
ALTER TABLE public.tareas_recurrentes ADD CONSTRAINT tareas_recurrentes_grupo_tarea_key UNIQUE (grupo_id, tarea_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_checklist_tareas_recurring 
  ON public.checklist_tareas (checklist_id, grupo_id, tarea_id)
  WHERE grupo_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_checklist_tareas_legacy
  ON public.checklist_tareas (checklist_id, tarea_id)
  WHERE grupo_id IS NULL;

-- 5. Useful Indexes
CREATE INDEX IF NOT EXISTS idx_checklists_fecha ON public.checklists (fecha);
CREATE INDEX IF NOT EXISTS idx_checklist_tareas_checklist_completada ON public.checklist_tareas (checklist_id, completada);
CREATE INDEX IF NOT EXISTS idx_checklist_tareas_grupo_id ON public.checklist_tareas (grupo_id);
CREATE INDEX IF NOT EXISTS idx_tareas_recurrentes_grupo_orden ON public.tareas_recurrentes (grupo_id, orden);
CREATE INDEX IF NOT EXISTS idx_grupo_colaboradores_colab_activo ON public.grupo_colaboradores (colaborador_id, activo);
CREATE INDEX IF NOT EXISTS idx_grupo_colaboradores_grupo_activo ON public.grupo_colaboradores (grupo_id, activo);

-- 6. Triggers
-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
DROP TRIGGER IF EXISTS trg_colaboradores_updated_at ON public.colaboradores;
CREATE TRIGGER trg_colaboradores_updated_at BEFORE UPDATE ON public.colaboradores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_checklists_updated_at ON public.checklists;
CREATE TRIGGER trg_checklists_updated_at BEFORE UPDATE ON public.checklists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_grupos_updated_at ON public.grupos;
CREATE TRIGGER trg_grupos_updated_at BEFORE UPDATE ON public.grupos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_grupo_colaboradores_updated_at ON public.grupo_colaboradores;
CREATE TRIGGER trg_grupo_colaboradores_updated_at BEFORE UPDATE ON public.grupo_colaboradores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_checklist_tareas_updated_at ON public.checklist_tareas;
CREATE TRIGGER trg_checklist_tareas_updated_at BEFORE UPDATE ON public.checklist_tareas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Completada trigger
CREATE OR REPLACE FUNCTION public.trg_fn_completada_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completada = true AND OLD.completada = false THEN
    NEW.completada_at = now();
  ELSIF NEW.completada = false AND OLD.completada = true THEN
    NEW.completada_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_checklist_tareas_completada ON public.checklist_tareas;
CREATE TRIGGER trg_checklist_tareas_completada BEFORE UPDATE OF completada ON public.checklist_tareas FOR EACH ROW EXECUTE FUNCTION public.trg_fn_completada_at();

-- Checklists.dia trigger
CREATE OR REPLACE FUNCTION public.trg_fn_set_checklists_dia()
RETURNS TRIGGER AS $$
DECLARE
  v_dias text[] := ARRAY['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  v_dow int;
BEGIN
  -- get ISODOW: 1=Mon, 7=Sun
  -- EXTRACT(DOW) returns 0=Sun, 6=Sat
  v_dow := EXTRACT(DOW FROM NEW.fecha)::int;
  NEW.dia := v_dias[v_dow + 1];
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_checklists_dia ON public.checklists;
CREATE TRIGGER trg_checklists_dia BEFORE INSERT OR UPDATE OF fecha ON public.checklists FOR EACH ROW EXECUTE FUNCTION public.trg_fn_set_checklists_dia();

-- 7. Recurrence Function
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
      g.nombre as grupo_nombre
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
    -- Ensure checklist exists for this collaborator and date
    INSERT INTO public.checklists (colaborador_asignado_id, fecha)
    VALUES (v_row.colaborador_id, p_fecha)
    ON CONFLICT (colaborador_asignado_id, fecha) DO NOTHING;
    
    SELECT id INTO v_checklist_id
    FROM public.checklists
    WHERE colaborador_asignado_id = v_row.colaborador_id AND fecha = p_fecha;

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

-- 8. BI View
CREATE OR REPLACE VIEW public.vw_historial_tareas AS
SELECT 
    ct.id AS checklist_tarea_id,
    c.id AS checklist_id,
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
JOIN public.colaboradores ca ON c.colaborador_asignado_id = ca.id
JOIN public.roles r ON ca.rol_id = r.id
LEFT JOIN public.colaboradores cr ON ct.colaborador_resuelve_id = cr.id
LEFT JOIN public.grupos g ON ct.grupo_id = g.id
LEFT JOIN public.tareas t ON ct.tarea_id = t.id;
