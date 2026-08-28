-- 018_tareas_qr.sql
-- 1. Agregar columnas de trazabilidad de Código QR a la tabla checklist_tareas
ALTER TABLE public.checklist_tareas
  ADD COLUMN IF NOT EXISTS qr_escaneado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS qr_escaneado_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS qr_escaneado_por BIGINT REFERENCES public.colaboradores(id) ON DELETE SET NULL;

-- 2. Crear índices para rendimiento y consultas de auditoría
CREATE INDEX IF NOT EXISTS idx_checklist_tareas_qr_escaneado 
  ON public.checklist_tareas (qr_escaneado);

CREATE INDEX IF NOT EXISTS idx_checklist_tareas_qr_escaneado_at 
  ON public.checklist_tareas (qr_escaneado_at);

-- 3. Actualizar la vista vw_historial_tareas para incluir trazabilidad de QR
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
    ct.colaborador_responsable_id,
    cresp.nombre AS colaborador_responsable,
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
    ct.foto_path,
    -- Campos de Trazabilidad QR
    ct.qr_escaneado,
    ct.qr_escaneado_at,
    ct.qr_escaneado_por,
    cqrp.nombre AS qr_escaneado_por_nombre,
    -- Campos de Auditoría
    ct.auditada,
    ct.auditoria_puntaje,
    ct.auditoria_comentario,
    ct.auditado_por_id,
    caud.nombre AS auditor_nombre,
    ct.auditado_at
FROM public.checklist_tareas ct
JOIN public.checklists c ON ct.checklist_id = c.id
LEFT JOIN public.proyectos p ON c.proyecto_id = p.id
LEFT JOIN public.colaboradores ca ON c.colaborador_asignado_id = ca.id
LEFT JOIN public.roles r ON ca.rol_id = r.id
LEFT JOIN public.colaboradores cresp ON ct.colaborador_responsable_id = cresp.id
LEFT JOIN public.colaboradores cr ON ct.colaborador_resuelve_id = cr.id
LEFT JOIN public.colaboradores cqrp ON ct.qr_escaneado_por = cqrp.id
LEFT JOIN public.colaboradores caud ON ct.auditado_por_id = caud.id
LEFT JOIN public.grupos g ON ct.grupo_id = g.id
LEFT JOIN public.tareas t ON ct.tarea_id = t.id;
