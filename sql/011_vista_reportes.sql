-- 011_vista_reportes.sql
-- Registrar la vista de Reportería en el catálogo del sistema

INSERT INTO public.vistas (nombre, ruta, categoria, descripcion) VALUES
  ('Reportería y Métricas', '/admin/reportes', 'Operaciones', 'Seguimiento, asignaciones y cumplimiento de checklists')
ON CONFLICT (ruta) DO NOTHING;

-- Asignar la vista al rol ADMIN
INSERT INTO public.rol_vistas (rol_id, vista_id)
SELECT r.id, v.id
FROM public.roles r
CROSS JOIN public.vistas v
WHERE r.rol = 'ADMIN' AND v.ruta = '/admin/reportes'
ON CONFLICT (rol_id, vista_id) DO NOTHING;
