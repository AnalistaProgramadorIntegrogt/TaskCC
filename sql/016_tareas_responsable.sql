-- 1. Agregar columna colaborador_responsable_id a checklist_tareas apuntando a colaboradores(id)
ALTER TABLE public.checklist_tareas 
ADD COLUMN IF NOT EXISTS colaborador_responsable_id bigint REFERENCES public.colaboradores(id) ON DELETE SET NULL;

-- 2. Backfill de datos históricos: poblar colaborador_responsable_id con el colaborador del checklist
UPDATE public.checklist_tareas ct
SET colaborador_responsable_id = c.colaborador_asignado_id
FROM public.checklists c
WHERE ct.checklist_id = c.id AND ct.colaborador_responsable_id IS NULL AND c.colaborador_asignado_id IS NOT NULL;

-- 3. Hacer colaborador_asignado_id nullable en checklists para admitir checklists compartidos de proyecto
ALTER TABLE public.checklists ALTER COLUMN colaborador_asignado_id DROP NOT NULL;

-- 4. Crear índice para optimizar consultas de tareas por responsable
CREATE INDEX IF NOT EXISTS idx_checklist_tareas_colab_responsable 
ON public.checklist_tareas (colaborador_responsable_id);
