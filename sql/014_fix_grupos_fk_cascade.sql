-- 014_fix_grupos_fk_cascade.sql
-- Asegurar que al eliminar un grupo no se generen errores 409 Conflict
-- 1. En checklist_tareas: poner ON DELETE SET NULL para preservar el historial y snapshot del grupo
ALTER TABLE public.checklist_tareas
  DROP CONSTRAINT IF EXISTS checklist_tareas_grupo_id_fkey;

ALTER TABLE public.checklist_tareas
  ADD CONSTRAINT checklist_tareas_grupo_id_fkey
  FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE SET NULL;

-- 2. En tareas_recurrentes: poner ON DELETE CASCADE
ALTER TABLE public.tareas_recurrentes
  DROP CONSTRAINT IF EXISTS tareas_recurrentes_grupo_id_fkey;

ALTER TABLE public.tareas_recurrentes
  ADD CONSTRAINT tareas_recurrentes_grupo_id_fkey
  FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;

-- 3. En grupo_colaboradores: poner ON DELETE CASCADE
ALTER TABLE public.grupo_colaboradores
  DROP CONSTRAINT IF EXISTS grupo_colaboradores_grupo_id_fkey;

ALTER TABLE public.grupo_colaboradores
  ADD CONSTRAINT grupo_colaboradores_grupo_id_fkey
  FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE CASCADE;
