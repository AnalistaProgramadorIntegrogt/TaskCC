-- 1. Crear tabla proyecto_checklists
CREATE TABLE IF NOT EXISTS public.proyecto_checklists (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  proyecto_id bigint NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  color text DEFAULT '#3b82f6',
  icono text DEFAULT 'clipboard',
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_proyecto_checklists_updated_at ON public.proyecto_checklists;
CREATE TRIGGER trg_proyecto_checklists_updated_at BEFORE UPDATE ON public.proyecto_checklists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Extender tablas existentes con proyecto_checklist_id
ALTER TABLE public.checklists 
  ADD COLUMN IF NOT EXISTS proyecto_checklist_id bigint REFERENCES public.proyecto_checklists(id) ON DELETE SET NULL;

ALTER TABLE public.checklist_tareas 
  ADD COLUMN IF NOT EXISTS proyecto_checklist_id bigint REFERENCES public.proyecto_checklists(id) ON DELETE SET NULL;

ALTER TABLE public.grupos 
  ADD COLUMN IF NOT EXISTS proyecto_checklist_id bigint REFERENCES public.proyecto_checklists(id) ON DELETE SET NULL;

-- 3. Actualizar restricciones únicas en checklists
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS checklists_colab_fecha_proyecto_key;

DROP INDEX IF EXISTS idx_checklists_colab_fecha_proyecto_tipo;
CREATE UNIQUE INDEX IF NOT EXISTS idx_checklists_colab_fecha_proyecto_tipo 
  ON public.checklists (colaborador_asignado_id, fecha, proyecto_id, COALESCE(proyecto_checklist_id, 0));

-- 4. Crear Checklist General por defecto para proyectos existentes
INSERT INTO public.proyecto_checklists (proyecto_id, nombre, descripcion, color)
SELECT p.id, 'Checklist General', 'Checklist principal generado por defecto', '#3b82f6'
FROM public.proyectos p
WHERE NOT EXISTS (
  SELECT 1 FROM public.proyecto_checklists pc WHERE pc.proyecto_id = p.id
);

-- 5. Backfill en checklists y checklist_tareas
UPDATE public.checklists c
SET proyecto_checklist_id = (
  SELECT pc.id FROM public.proyecto_checklists pc 
  WHERE pc.proyecto_id = c.proyecto_id 
  ORDER BY pc.id ASC LIMIT 1
)
WHERE c.proyecto_checklist_id IS NULL;

UPDATE public.checklist_tareas ct
SET proyecto_checklist_id = c.proyecto_checklist_id
FROM public.checklists c
WHERE ct.checklist_id = c.id AND ct.proyecto_checklist_id IS NULL;

-- 6. Políticas RLS y Permisos
ALTER TABLE public.proyecto_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable ALL for authenticated proyecto_checklists" ON public.proyecto_checklists;
CREATE POLICY "Enable ALL for authenticated proyecto_checklists" ON public.proyecto_checklists FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.proyecto_checklists TO anon, authenticated, service_role;
