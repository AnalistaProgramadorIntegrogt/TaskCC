-- 1. Modificar restricciones de recurrencia en public.grupos
ALTER TABLE public.grupos DROP CONSTRAINT IF EXISTS grupos_recurrencia_tipo_check;
ALTER TABLE public.grupos DROP CONSTRAINT IF EXISTS chk_grupos_semanal;
ALTER TABLE public.grupos DROP CONSTRAINT IF EXISTS chk_grupos_mensual;

ALTER TABLE public.grupos 
  ADD CONSTRAINT chk_grupos_recurrencia_tipo CHECK (recurrencia_tipo IN ('diario', 'semanal', 'mensual') OR recurrencia_tipo IS NULL);

-- 2. Actualizar función generar_checklists_para_fecha
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
        (g.recurrencia_tipo = 'diario' AND (g.dia_semana IS NULL OR EXTRACT(ISODOW FROM p_fecha) = g.dia_semana))
        OR
        (g.recurrencia_tipo = 'semanal')
        OR
        (g.recurrencia_tipo = 'mensual')
      )
  LOOP
    INSERT INTO public.checklists (colaborador_asignado_id, fecha, proyecto_id)
    VALUES (v_row.colaborador_id, p_fecha, v_row.proyecto_id)
    ON CONFLICT (colaborador_asignado_id, fecha, proyecto_id) DO NOTHING;
    
    SELECT id INTO v_checklist_id
    FROM public.checklists
    WHERE colaborador_asignado_id = v_row.colaborador_id AND fecha = p_fecha AND proyecto_id = v_row.proyecto_id;

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
