-- 1. Crear tabla de Vistas del sistema
CREATE TABLE IF NOT EXISTS public.vistas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  ruta text NOT NULL UNIQUE,
  categoria text DEFAULT 'General',
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Crear tabla intermedia rol_vistas (M:N entre roles y vistas)
CREATE TABLE IF NOT EXISTS public.rol_vistas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rol_id bigint NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  vista_id bigint NOT NULL REFERENCES public.vistas(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rol_vistas_unique UNIQUE (rol_id, vista_id)
);

-- 3. Insertar Catálogo Inicial de Vistas de la aplicación
INSERT INTO public.vistas (nombre, ruta, categoria, descripcion) VALUES
  ('Inicio / Dashboard', '/', 'General', 'Vista principal con accesos y estado'),
  ('Checklists Diarios', '/checklists', 'Operaciones', 'Formulario y seguimiento de checklists diarios'),
  ('Proyectos', '/proyectos', 'Operaciones', 'Listado e información detallada de proyectos'),
  ('Gestión de Usuarios', '/admin/usuarios', 'Administración', 'Administración de colaboradores, permisos y estado de acceso'),
  ('Gestión de Proyectos', '/admin/proyectos', 'Administración', 'Creación y configuración de proyectos y tareas'),
  ('Gestión de Roles', '/admin/roles', 'Administración', 'Creación de roles y asignación de vistas y permisos')
ON CONFLICT (ruta) DO NOTHING;

-- 4. Asignar todas las vistas por defecto al rol ADMIN
INSERT INTO public.rol_vistas (rol_id, vista_id)
SELECT r.id, v.id
FROM public.roles r
CROSS JOIN public.vistas v
WHERE r.rol = 'ADMIN'
ON CONFLICT (rol_id, vista_id) DO NOTHING;

-- 5. Políticas RLS y Permisos
DROP POLICY IF EXISTS "Enable ALL for authenticated roles" ON public.roles;
CREATE POLICY "Enable ALL for authenticated roles" ON public.roles FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable ALL for authenticated vistas" ON public.vistas;
CREATE POLICY "Enable ALL for authenticated vistas" ON public.vistas FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable ALL for authenticated rol_vistas" ON public.rol_vistas;
CREATE POLICY "Enable ALL for authenticated rol_vistas" ON public.rol_vistas FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.roles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.vistas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.rol_vistas TO anon, authenticated, service_role;
