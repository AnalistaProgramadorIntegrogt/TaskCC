-- 017_unique_tareas_nombre.sql
-- 1. Deduplicar registros existentes en la tabla tareas
-- Si existen tareas con el mismo nombre (insensible a mayúsculas y espacios),
-- consolidamos las referencias en tareas_recurrentes y checklist_tareas al ID principal más antiguo (MIN(id)).

DO $$
DECLARE
    rec RECORD;
    canonical_id BIGINT;
    dup_ids BIGINT[];
BEGIN
    FOR rec IN 
        SELECT LOWER(TRIM(nombre)) AS norm_nombre, ARRAY_AGG(id ORDER BY id ASC) AS ids
        FROM public.tareas
        GROUP BY LOWER(TRIM(nombre))
        HAVING COUNT(*) > 1
    LOOP
        canonical_id := rec.ids[1];
        dup_ids := rec.ids[2:array_length(rec.ids, 1)];

        -- Actualizar checklist_tareas para que apunten al canonical_id
        UPDATE public.checklist_tareas
        SET tarea_id = canonical_id
        WHERE tarea_id = ANY(dup_ids);

        -- En tareas_recurrentes: eliminar posibles duplicados de grupo_id + tarea_id que colisionarían
        DELETE FROM public.tareas_recurrentes tr_dup
        WHERE tr_dup.tarea_id = ANY(dup_ids)
          AND EXISTS (
              SELECT 1 FROM public.tareas_recurrentes tr_canon
              WHERE tr_canon.grupo_id = tr_dup.grupo_id
                AND tr_canon.tarea_id = canonical_id
          );

        -- Actualizar el resto de tareas_recurrentes para apuntar a canonical_id
        UPDATE public.tareas_recurrentes
        SET tarea_id = canonical_id
        WHERE tarea_id = ANY(dup_ids);

        -- Eliminar las tareas duplicadas de la tabla tareas
        DELETE FROM public.tareas
        WHERE id = ANY(dup_ids);
    END LOOP;
END $$;

-- 2. Crear índice único para asegurar que no se puedan insertar tareas duplicadas por nombre
CREATE UNIQUE INDEX IF NOT EXISTS idx_tareas_nombre_unique 
ON public.tareas (LOWER(TRIM(nombre)));
