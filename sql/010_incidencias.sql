-- 1. Crear tabla de incidencias
CREATE TABLE IF NOT EXISTS public.incidencias (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  colaborador_id bigint NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  proyecto_id bigint REFERENCES public.proyectos(id) ON DELETE SET NULL,
  checklist_tarea_id bigint REFERENCES public.checklist_tareas(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descripcion text,
  foto_url text,
  foto_path text,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  hora time NOT NULL DEFAULT CURRENT_TIME,
  fecha_hora timestamptz NOT NULL DEFAULT now(),
  estado text NOT NULL DEFAULT 'abierta', -- 'abierta', 'en_proceso', 'resuelta'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trg_incidencias_updated_at ON public.incidencias;
CREATE TRIGGER trg_incidencias_updated_at 
  BEFORE UPDATE ON public.incidencias 
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Índices de búsqueda
CREATE INDEX IF NOT EXISTS idx_incidencias_colaborador ON public.incidencias(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_fecha ON public.incidencias(fecha);
CREATE INDEX IF NOT EXISTS idx_incidencias_proyecto ON public.incidencias(proyecto_id);

-- 4. Políticas RLS y Permisos
ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable ALL for authenticated incidencias" ON public.incidencias;
CREATE POLICY "Enable ALL for authenticated incidencias" ON public.incidencias 
  FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.incidencias TO anon, authenticated, service_role;
