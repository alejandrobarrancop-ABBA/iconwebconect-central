-- ==============================================================================
-- ICONWEBCONECT-CENTRAL 🌐
-- Esquema SaaS Multi-Tenant, Distribuidores y Servidor de Licencias Online
-- Compatible con PostgreSQL / Supabase
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE DISTRIBUIDORES (Socios comerciales / Resellers)
CREATE TABLE IF NOT EXISTS public.distribuidores (
    id TEXT PRIMARY KEY,                       -- Ej: 'dist-abba', 'dist-grupovev'
    nombre TEXT NOT NULL,                      -- Ej: 'ABBA INNOVATION S.A.'
    ruc TEXT,                                  -- RUC / DV
    email TEXT,
    telefono TEXT,
    contacto_principal TEXT,
    comision_pct NUMERIC(5, 2) DEFAULT 20.00,  -- % comisión por licencias vendidas
    estado TEXT DEFAULT 'activo',              -- 'activo', 'suspendido'
    creado_el TIMESTAMPTZ DEFAULT NOW(),
    actualizado_el TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE PLANES DE SUSCRIPCIÓN
CREATE TABLE IF NOT EXISTS public.planes_suscripcion (
    id TEXT PRIMARY KEY,                       -- Ej: 'plan-central-anual', 'plan-onpremise-anual'
    nombre TEXT NOT NULL,
    codigo TEXT UNIQUE NOT NULL,
    tipo_producto TEXT NOT NULL,               -- 'CENTRAL_CLOUD', 'ON_PREMISE_POS', 'COMBO'
    precio_anual NUMERIC(10, 2) NOT NULL,
    max_sucursales INT DEFAULT 5,
    max_cajas INT DEFAULT 10,
    modulos JSONB DEFAULT '["ventas", "cierres", "kpis", "ai_reports"]'::jsonb,
    activo BOOLEAN DEFAULT TRUE,
    creado_el TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACTUALIZACIÓN DE TABLA DE EMPRESAS (CLIENTES FINALES / TENANTS)
-- Si no existen las columnas, se agregan de forma segura
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='distribuidor_id') THEN
        ALTER TABLE public.empresas ADD COLUMN distribuidor_id TEXT REFERENCES public.distribuidores(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='plan_id') THEN
        ALTER TABLE public.empresas ADD COLUMN plan_id TEXT REFERENCES public.planes_suscripcion(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='estado') THEN
        ALTER TABLE public.empresas ADD COLUMN estado TEXT DEFAULT 'activo'; -- 'activo', 'suspendido', 'demo'
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='tipo_suscripcion') THEN
        ALTER TABLE public.empresas ADD COLUMN tipo_suscripcion TEXT DEFAULT 'ANUAL';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='cajas_contratadas') THEN
        ALTER TABLE public.empresas ADD COLUMN cajas_contratadas INT DEFAULT 2;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='fecha_vencimiento') THEN
        ALTER TABLE public.empresas ADD COLUMN fecha_vencimiento DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='empresas' AND column_name='logo_url') THEN
        ALTER TABLE public.empresas ADD COLUMN logo_url TEXT DEFAULT '/goyurt-logo.png';
    END IF;
END $$;

-- 4. TABLA DE LICENCIAS Y SUSCRIPCIONES (Nube Central y On-Premise)
CREATE TABLE IF NOT EXISTS public.licencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id TEXT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    distribuidor_id TEXT REFERENCES public.distribuidores(id) ON DELETE SET NULL,
    tipo_producto TEXT NOT NULL,               -- 'CENTRAL_CLOUD', 'ON_PREMISE_POS', 'COMBO'
    licencia_key TEXT UNIQUE NOT NULL,         -- Ej: 'ICON-OP-2026-F4B2-99AC-11EA'
    token_activacion UUID DEFAULT uuid_generate_v4(),
    cajas_autorizadas INT DEFAULT 2,
    sucursales_autorizadas INT DEFAULT 1,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    dias_gracia INT DEFAULT 7,
    estado TEXT DEFAULT 'ACTIVA',              -- 'ACTIVA', 'SUSPENDIDA', 'VENCIDA', 'PENDIENTE_PAGO'
    pago_estado TEXT DEFAULT 'PAGADO',         -- 'PAGADO', 'PENDIENTE', 'RENOVADO'
    monto_anual NUMERIC(10, 2) DEFAULT 0.00,
    moneda TEXT DEFAULT 'USD',
    hardware_id TEXT,                          -- ID de máquina registrado en primer check-in
    machine_name TEXT,                         -- Nombre de PC / Servidor
    ip_origen TEXT,
    ultimo_check_in TIMESTAMPTZ,
    detalles JSONB DEFAULT '{}'::jsonb,
    creado_el TIMESTAMPTZ DEFAULT NOW(),
    actualizado_el TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HISTORIAL DE VALIDACIONES / CHECK-INS ONLINE (ON-PREMISE VALIDATION LOG)
CREATE TABLE IF NOT EXISTS public.licencias_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licencia_id UUID NOT NULL REFERENCES public.licencias(id) ON DELETE CASCADE,
    hardware_id TEXT,
    machine_name TEXT,
    ip TEXT,
    version_pos TEXT,
    resultado TEXT NOT NULL,                   -- 'EXITOSO', 'VENCIDO', 'BLOQUEADO'
    verificado_el TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POLÍTICAS DE ACCESO (RLS)
ALTER TABLE public.distribuidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licencias_checkins ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir lectura y validación pública/anon para API de licencias
DROP POLICY IF EXISTS "Permitir lectura anonima a distribuidores" ON public.distribuidores;
CREATE POLICY "Permitir lectura anonima a distribuidores" ON public.distribuidores FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir lectura anonima a planes" ON public.planes_suscripcion;
CREATE POLICY "Permitir lectura anonima a planes" ON public.planes_suscripcion FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir operacion anonima a licencias" ON public.licencias;
CREATE POLICY "Permitir operacion anonima a licencias" ON public.licencias FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir operacion anonima a licencias_checkins" ON public.licencias_checkins;
CREATE POLICY "Permitir operacion anonima a licencias_checkins" ON public.licencias_checkins FOR ALL USING (true);

-- 7. SEED DATA INICIAL
INSERT INTO public.distribuidores (id, nombre, ruc, email, telefono, contacto_principal, comision_pct)
VALUES 
    ('dist-abba', 'ABBA INNOVATION S.A.', '155773714-2-2025', 'soporte@abbainnovation.com', '+507 6000-0000', 'Alejandro Barranco', 25.00),
    ('dist-grupovev', 'GRUPO VEV, S.A.', '155700000-2-2024', 'ventas@grupovev.com', '+507 6111-1111', 'Gerencia Comercial', 30.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.planes_suscripcion (id, nombre, codigo, tipo_producto, precio_anual, max_sucursales, max_cajas)
VALUES
    ('plan-central-std', 'ICONWEBCONECT Central Cloud (Anual)', 'CENTRAL_STD', 'CENTRAL_CLOUD', 360.00, 5, 10),
    ('plan-onpremise-std', 'ICONWEBCONECT On-Premise POS (Anual)', 'ONPREMISE_STD', 'ON_PREMISE_POS', 240.00, 1, 2),
    ('plan-combo-enterprise', 'ICONWEBCONECT Combo Cloud + On-Premise (Anual)', 'COMBO_ENT', 'COMBO', 550.00, 10, 20)
ON CONFLICT (id) DO NOTHING;

-- Asegurar asignación de Goyurt al distribuidor ABBA Innovation
UPDATE public.empresas 
SET distribuidor_id = 'dist-abba', 
    plan_id = 'plan-combo-enterprise',
    estado = 'activo',
    tipo_suscripcion = 'ANUAL',
    cajas_contratadas = 4,
    fecha_vencimiento = CURRENT_DATE + INTERVAL '1 year'
WHERE id = 'goyurt';

-- Licencias iniciales para Goyurt Panamá
INSERT INTO public.licencias (
    empresa_id, distribuidor_id, tipo_producto, licencia_key, 
    cajas_autorizadas, sucursales_autorizadas, fecha_emision, fecha_vencimiento, 
    estado, pago_estado, monto_anual
) VALUES 
    ('goyurt', 'dist-abba', 'CENTRAL_CLOUD', 'ICON-CC-2026-GOYURT-PANAMA-9A1B', 10, 5, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'ACTIVA', 'PAGADO', 360.00),
    ('goyurt', 'dist-abba', 'ON_PREMISE_POS', 'ICON-OP-2026-8F42-99B1-7C4E', 2, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'ACTIVA', 'PAGADO', 240.00)
ON CONFLICT (licencia_key) DO NOTHING;
