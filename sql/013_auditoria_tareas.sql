-- 013_auditoria_tareas.sql
-- Módulo de Auditoría y Calificación de Tareas Completadas

-- 1. Agregar columnas de auditoría a la tabla checklist_tareas
ALTER TABLE public.checklist_tareas 
  ADD COLUMN IF NOT EXISTS auditada boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auditoria_puntaje smallint CHECK (auditoria_puntaje >= 1 AND auditoria_puntaje <= 10),
  ADD COLUMN IF NOT EXISTS auditoria_comentario text,
  ADD COLUMN IF NOT EXISTS auditado_por_id bigint REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS auditado_at timestamptz;

-- 2. Crear índices para optimizar consultas de auditoría
CREATE INDEX IF NOT EXISTS idx_checklist_tareas_auditada 
  ON public.checklist_tareas (completada, auditada);

CREATE INDEX IF NOT EXISTS idx_checklist_tareas_completada_at 
  ON public.checklist_tareas (completada_at);

CREATE INDEX IF NOT EXISTS idx_checklist_tareas_auditado_por 
  ON public.checklist_tareas (auditado_por_id);

-- 3. Actualizar la vista vw_historial_tareas con los nuevos campos de auditoría
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
    ct.foto_path,
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
JOIN public.colaboradores ca ON c.colaborador_asignado_id = ca.id
JOIN public.roles r ON ca.rol_id = r.id
LEFT JOIN public.colaboradores cr ON ct.colaborador_resuelve_id = cr.id
LEFT JOIN public.colaboradores caud ON ct.auditado_por_id = caud.id
LEFT JOIN public.grupos g ON ct.grupo_id = g.id
LEFT JOIN public.tareas t ON ct.tarea_id = t.id;

-- 4. Registrar la vista de Auditoría en el catálogo de vistas del sistema
INSERT INTO public.vistas (nombre, ruta, categoria, descripcion) VALUES
  ('Auditoría de Tareas', '/admin/auditoria', 'Operaciones', 'Auditoría, revisión y calificación de tareas completadas')
ON CONFLICT (ruta) DO NOTHING;

-- 5. Asignar la vista al rol ADMIN por defecto
INSERT INTO public.rol_vistas (rol_id, vista_id)
SELECT r.id, v.id
FROM public.roles r
CROSS JOIN public.vistas v
WHERE r.rol = 'ADMIN' AND v.ruta = '/admin/auditoria'
ON CONFLICT (rol_id, vista_id) DO NOTHING;
