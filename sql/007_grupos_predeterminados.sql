-- 1. Permite que proyecto_id sea NULL en public.grupos para los grupos por defecto
ALTER TABLE public.grupos ALTER COLUMN proyecto_id DROP NOT NULL;

-- 2. Asegurar políticas RLS y Permisos en grupos, tareas, tareas_recurrentes
DROP POLICY IF EXISTS "Enable ALL for authenticated grupos" ON public.grupos;
CREATE POLICY "Enable ALL for authenticated grupos" ON public.grupos FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable ALL for authenticated tareas" ON public.tareas;
CREATE POLICY "Enable ALL for authenticated tareas" ON public.tareas FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable ALL for authenticated tareas_recurrentes" ON public.tareas_recurrentes;
CREATE POLICY "Enable ALL for authenticated tareas_recurrentes" ON public.tareas_recurrentes FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.grupos TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.tareas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.tareas_recurrentes TO anon, authenticated, service_role;
