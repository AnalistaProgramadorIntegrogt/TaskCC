-- 1. Crear tabla intermedia proyecto_colaboradores (M:N entre proyectos y colaboradores)
CREATE TABLE IF NOT EXISTS public.proyecto_colaboradores (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  colaborador_id bigint NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  proyecto_id bigint NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_proyecto_colaborador UNIQUE (proyecto_id, colaborador_id)
);

-- 2. Políticas RLS y Permisos
ALTER TABLE public.proyecto_colaboradores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable ALL for authenticated proyecto_colaboradores" ON public.proyecto_colaboradores;
CREATE POLICY "Enable ALL for authenticated proyecto_colaboradores" ON public.proyecto_colaboradores FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.proyecto_colaboradores TO anon, authenticated, service_role;
