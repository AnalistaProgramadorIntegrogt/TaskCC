-- sql/012_montajes.sql
-- 1. Crear tabla de Registro de Montajes
CREATE TABLE IF NOT EXISTS public.montajes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  proyecto_id bigint NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  colaborador_id bigint REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  titulo text NOT NULL DEFAULT 'Montaje',
  descripcion text NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  hora time NOT NULL DEFAULT CURRENT_TIME,
  fecha_hora timestamptz NOT NULL DEFAULT now(),
  estado text NOT NULL DEFAULT 'completado', -- 'programado', 'en_proceso', 'completado'
  foto_url text,
  foto_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Trigger updated_at
DROP TRIGGER IF EXISTS trg_montajes_updated_at ON public.montajes;
CREATE TRIGGER trg_montajes_updated_at 
  BEFORE UPDATE ON public.montajes 
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_montajes_proyecto ON public.montajes(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_montajes_colaborador ON public.montajes(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_montajes_fecha ON public.montajes(fecha);

-- 4. RLS y Permisos
ALTER TABLE public.montajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable ALL for authenticated montajes" ON public.montajes;
CREATE POLICY "Enable ALL for authenticated montajes" ON public.montajes 
  FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.montajes TO anon, authenticated, service_role;
