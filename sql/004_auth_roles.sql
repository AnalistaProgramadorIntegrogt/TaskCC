-- 1. Modificar tabla colaboradores
ALTER TABLE public.colaboradores 
ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS aprobado boolean NOT NULL DEFAULT false;

-- 2. Insertar Roles
INSERT INTO public.roles (rol) VALUES ('ADMIN'), ('USER') ON CONFLICT (rol) DO NOTHING;

-- 3. Crear función de trigger para nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_user_rol_id bigint;
BEGIN
  -- Obtener el ID del rol 'USER'
  SELECT id INTO v_user_rol_id FROM public.roles WHERE rol = 'USER';
  
  -- Insertar en colaboradores con los metadatos
  INSERT INTO public.colaboradores (auth_id, nombre, email, telefono, rol_id, aprobado)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario Nuevo'),
    NEW.email,
    NEW.raw_user_meta_data->>'telefono',
    v_user_rol_id,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adjuntar el trigger a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Crear Usuario Admin por defecto
DO $$
DECLARE
  v_admin_auth_id uuid;
  v_admin_rol_id bigint;
BEGIN
  -- Obtener rol ADMIN
  SELECT id INTO v_admin_rol_id FROM public.roles WHERE rol = 'ADMIN';

  -- Si el email ya existe en auth.users, no lo duplicamos
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'diego.medina@integro.gt') THEN
    v_admin_auth_id := gen_random_uuid();
    
    -- Insertar en auth.users (usando pgcrypto para la contraseña)
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_admin_auth_id, 'authenticated', 'authenticated', 'diego.medina@integro.gt', 
      crypt('Integro2026!', gen_salt('bf')), now(), 
      '{"provider": "email", "providers": ["email"]}', '{"nombre": "Diego Medina", "telefono": "45910878"}', now(), now(), '', '', '', ''
    );
    
    -- El trigger habrá creado la entrada en colaboradores automáticamente (como USER y no aprobado).
    -- Debemos actualizarlo a ADMIN y aprobado = true.
    UPDATE public.colaboradores 
    SET rol_id = v_admin_rol_id, aprobado = true 
    WHERE auth_id = v_admin_auth_id;
  END IF;
END;
$$;
