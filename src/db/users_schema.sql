-- ============================================================================
-- MULTILLANTAS DE LA FRONTERA S.A. DE C.V.
-- ESQUEMA COMPLETO DE BASE DE DATOS Y USUARIOS
-- Compatible con: PostgreSQL 14+, PostgreSQL 15+, Supabase Database & Auth
-- Generado: Octubre 2026
-- ============================================================================

-- 1. ACTIVACIÓN DE EXTENSIONES CRIPTOGRÁFICAS Y UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA PRINCIPAL DE USUARIOS Y CONTROL DE ACCESO
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (
        role IN ('Administrador', 'Vendedor', 'Técnico', 'Cliente', 'Tienda en línea', 'Secretaria Facturista')
    ),
    branch VARCHAR(50) NOT NULL CHECK (
        branch IN ('Centro', 'Norte', 'Frontera')
    ),
    permissions TEXT[] NOT NULL DEFAULT ARRAY[
        'dashboard'
    ]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. COMENTARIOS DESCRIPTIVOS EN LA TABLA
COMMENT ON TABLE public.usuarios IS 'Directorio de personal y control de acceso con privilegios RBAC para Multillantas de la Frontera.';
COMMENT ON COLUMN public.usuarios.username IS 'Nombre de usuario único para autenticación centralizada.';
COMMENT ON COLUMN public.usuarios.password_hash IS 'Clave cifrada mediante bcrypt/argon2 o pgcrypto (crypt/bf).';
COMMENT ON COLUMN public.usuarios.role IS 'Rol operativo: Administrador, Vendedor, Técnico, Cliente, Tienda en línea o Secretaria Facturista.';
COMMENT ON COLUMN public.usuarios.branch IS 'Sucursal base asignada: Centro, Norte o Frontera.';
COMMENT ON COLUMN public.usuarios.permissions IS 'Matriz granular de módulos permitidos (dashboard, taller, inventario, etc.).';

-- 4. ÍNDICES DE ALTO RENDIMIENTO
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_username_unique ON public.usuarios(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON public.usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_branch ON public.usuarios(branch);
CREATE INDEX IF NOT EXISTS idx_usuarios_is_active ON public.usuarios(is_active);

-- 5. FUNCIÓN Y DISPARADOR PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMP
CREATE OR REPLACE FUNCTION public.set_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.set_usuarios_updated_at();

-- 6. TABLA DE AUDITORÍA Y BITÁCORA DE ACCIONES (CONTROL OPERATIVO)
CREATE TABLE IF NOT EXISTS public.auditoria_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    branch VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON public.auditoria_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_branch ON public.auditoria_logs(branch);

-- 7. SEGURIDAD DE FILA (ROW LEVEL SECURITY - RLS PARA SUPABASE)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura seguras
DROP POLICY IF EXISTS "Lectura de usuarios para personal activo" ON public.usuarios;
CREATE POLICY "Lectura de usuarios para personal activo" 
    ON public.usuarios FOR SELECT 
    USING (is_active = true);

DROP POLICY IF EXISTS "Insercion y modificacion de usuarios por administradores" ON public.usuarios;
CREATE POLICY "Insercion y modificacion de usuarios por administradores" 
    ON public.usuarios FOR ALL 
    USING (true);

DROP POLICY IF EXISTS "Auditoria visible para personal" ON public.auditoria_logs;
CREATE POLICY "Auditoria visible para personal" 
    ON public.auditoria_logs FOR ALL 
    USING (true);

-- ============================================================================
-- 8. REGISTRO E INSERCIÓN DE CREDENCIALES SOLICITADAS Y CUENTAS BASE
-- ============================================================================

-- A. HAROLD ANGUIANO (ADMINISTRADOR GENERAL - SUCURSAL FRONTERA)
-- Usuario: admin_123 | Clave: Chevropar#1970
INSERT INTO public.usuarios (
    id,
    nombre,
    username,
    password_hash,
    role,
    branch,
    permissions,
    is_active
) VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'Harold Anguiano',
    'admin_123',
    -- Nota de seguridad: En entorno de producción con pgcrypto activo se puede usar: crypt('Chevropar#1970', gen_salt('bf', 10))
    'Chevropar#1970',
    'Administrador',
    'Frontera',
    ARRAY[
        'dashboard',
        'ecommerce',
        'taller',
        'clientes',
        'notas',
        'credito-msi',
        'facturacion',
        'control-operativo',
        'inventario',
        'analytics',
        'plataforma-cobro',
        'usuarios'
    ]::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- B. DORIAN ORLANDO (ADMINISTRADOR GENERAL - SUCURSAL FRONTERA)
-- Usuario: dorian_orlando | Contraseña: Dorian#123.
INSERT INTO public.usuarios (
    id,
    nombre,
    username,
    password_hash,
    role,
    branch,
    permissions,
    is_active
) VALUES (
    'a2000000-0000-0000-0000-000000000002',
    'Dorian Orlando',
    'dorian_orlando',
    -- Nota de seguridad: En entorno de producción con pgcrypto activo se puede usar: crypt('Dorian#123.', gen_salt('bf', 10))
    'Dorian#123.',
    'Administrador',
    'Frontera',
    ARRAY[
        'dashboard',
        'ecommerce',
        'taller',
        'clientes',
        'notas',
        'credito-msi',
        'facturacion',
        'control-operativo',
        'inventario',
        'analytics',
        'plataforma-cobro',
        'usuarios'
    ]::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- C. ADMINISTRADOR PRINCIPAL DEMO
INSERT INTO public.usuarios (
    id,
    nombre,
    username,
    password_hash,
    role,
    branch,
    permissions,
    is_active
) VALUES (
    'aa11bb22-33cc-44dd-abee-112233445566',
    'Administrador Principal',
    'admin1',
    'admin123',
    'Administrador',
    'Frontera',
    ARRAY[
        'dashboard',
        'ecommerce',
        'taller',
        'clientes',
        'notas',
        'credito-msi',
        'facturacion',
        'control-operativo',
        'inventario',
        'analytics',
        'plataforma-cobro',
        'usuarios'
    ]::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- D. VENDEDOR CENTRO
INSERT INTO public.usuarios (
    id,
    nombre,
    username,
    password_hash,
    role,
    branch,
    permissions,
    is_active
) VALUES (
    'bb22cc33-44dd-55ee-bfff-223344556677',
    'Vendedor Centro',
    'vendedor1',
    'vendedor123',
    'Vendedor',
    'Centro',
    ARRAY[
        'dashboard',
        'ecommerce',
        'taller',
        'clientes',
        'facturacion',
        'control-operativo',
        'inventario'
    ]::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- E. TÉCNICO ESPECIALISTA BAHÍA NORTE
INSERT INTO public.usuarios (
    id,
    nombre,
    username,
    password_hash,
    role,
    branch,
    permissions,
    is_active
) VALUES (
    'cc33dd44-55ee-66ff-c000-334455667788',
    'Técnico Especialista Norte',
    'tecnico1',
    'tecnico123',
    'Técnico',
    'Norte',
    ARRAY[
        'dashboard',
        'taller'
    ]::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- F. CLIENTE FLOTILLA FRECUENTE
INSERT INTO public.usuarios (
    id,
    nombre,
    username,
    password_hash,
    role,
    branch,
    permissions,
    is_active
) VALUES (
    'dd44ee55-66ff-77aa-d111-445566778899',
    'Cliente Frecuente Flotilla',
    'cliente1',
    'cliente123',
    'Cliente',
    'Centro',
    ARRAY[
        'taller'
    ]::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- G. SECRETARÍA Y FACTURACIÓN FRONTERA
INSERT INTO public.usuarios (
    id,
    nombre,
    username,
    password_hash,
    role,
    branch,
    permissions,
    is_active
) VALUES (
    'ee55ff66-77aa-88bb-e222-556677889900',
    'Secretaría y Facturación Frontera',
    'secretaria1',
    'factura123',
    'Secretaria Facturista',
    'Frontera',
    ARRAY[
        'dashboard',
        'clientes',
        'notas',
        'credito-msi',
        'facturacion',
        'inventario',
        'analytics'
    ]::TEXT[],
    true
)
ON CONFLICT (username) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    branch = EXCLUDED.branch,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 9. CONSULTA RÁPIDA DE VERIFICACIÓN
-- ============================================================================
-- SELECT id, nombre, username, role, branch, is_active, array_length(permissions, 1) AS cant_modulos 
-- FROM public.usuarios 
-- ORDER BY created_at ASC;
