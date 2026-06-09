-- ============================================================
-- TABLA DE USUARIOS - MULTILLANTAS DE LA FRONTERA
-- Compatible con PostgreSQL y Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- En producción, almacenar codificado mediante Argon2/bcrypt
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrador', 'Vendedor', 'Técnico', 'Cliente', 'Tienda en línea', 'Secretaria Facturista')),
    branch VARCHAR(50) NOT NULL CHECK (branch IN ('Centro', 'Norte', 'Frontera')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices para alto rendimiento y consulta de logins
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_username_unique ON public.usuarios(username);

-- ============================================================
-- REGISTROS / SEEDS DE INTRODUCCIÓN RAPIDA (PROTOTIPO Y PRUEBAS)
-- ============================================================

INSERT INTO public.usuarios (id, nombre, username, password_hash, role, branch)
VALUES (
    'aa11bb22-33cc-44dd-abee-112233445566', 
    'Administrador Principal', 
    'admin1', 
    'admin123', -- Representación para entorno sandbox de desarrollo
    'Administrador', 
    'Frontera'
) ON CONFLICT (username) DO NOTHING;

-- Registro de vendedor de pruebas
INSERT INTO public.usuarios (id, nombre, username, password_hash, role, branch)
VALUES (
    'bb22cc33-44dd-55ee-bfff-223344556677', 
    'Vendedor Centro', 
    'vendedor1', 
    'vendedor123', 
    'Vendedor', 
    'Centro'
) ON CONFLICT (username) DO NOTHING;
