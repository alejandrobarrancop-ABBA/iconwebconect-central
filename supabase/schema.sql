-- ==============================================================================
-- ICONWEBCONECT-CENTRAL 🌐
-- Esquema Centralizado en Supabase (PostgreSQL) para Consolidación Multi-Sucursal
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE EMPRESAS / ORGANIZACIONES
CREATE TABLE IF NOT EXISTS public.empresas (
    id TEXT PRIMARY KEY,                       -- Ej: 'goyurt'
    nombre TEXT NOT NULL,
    ruc TEXT,
    telefono TEXT,
    email TEXT,
    creado_el TIMESTAMPTZ DEFAULT NOW(),
    actualizado_el TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE SUCURSALES
CREATE TABLE IF NOT EXISTS public.sucursales (
    id TEXT PRIMARY KEY,                       -- Ej: 'sucursal-01'
    empresa_id TEXT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL,                      -- Código en ICG o asignado (ej: '01')
    nombre TEXT NOT NULL,                      -- Ej: 'GOYURT Multiplaza'
    direccion TEXT,
    telefono TEXT,
    activa BOOLEAN DEFAULT TRUE,
    creado_el TIMESTAMPTZ DEFAULT NOW(),
    actualizado_el TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, codigo)
);

-- 4. TABLA DE CAJAS / TERMINALES POR SUCURSAL
CREATE TABLE IF NOT EXISTS public.cajas (
    id TEXT PRIMARY KEY,                       -- Ej: 'sucursal-01-caja-01'
    sucursal_id TEXT NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    codigo_caja TEXT NOT NULL,                 -- Ej: 'CAJA1'
    descripcion TEXT,
    serie_asignada TEXT,                       -- Serie por defecto en ICG (ej: 'T1')
    activa BOOLEAN DEFAULT TRUE,
    ultima_sincronizacion TIMESTAMPTZ,
    creado_el TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sucursal_id, codigo_caja)
);

-- 5. TABLA DE HEARTBEAT (MONITOREO DE CONEXIÓN EN TIEMPO REAL)
CREATE TABLE IF NOT EXISTS public.sucursales_heartbeat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id TEXT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    sucursal_id TEXT NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    caja_id TEXT,
    ip_local TEXT,
    version_agente TEXT,
    ultimo_ping TIMESTAMPTZ DEFAULT NOW(),
    estado TEXT DEFAULT 'ONLINE',              -- 'ONLINE', 'WARNING', 'OFFLINE'
    detalles JSONB DEFAULT '{}'::jsonb,
    UNIQUE(empresa_id, sucursal_id, caja_id)
);

-- 6. TABLA DE VENTAS (CABECERA)
CREATE TABLE IF NOT EXISTS public.ventas_cabecera (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id TEXT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    sucursal_id TEXT NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    caja_id TEXT,
    serie TEXT NOT NULL,
    numero BIGINT NOT NULL,
    fecha_hora TIMESTAMPTZ NOT NULL,
    fecha DATE NOT NULL,                       -- Para particionado y agregados rápidos
    hora SMALLINT NOT NULL,                    -- 0 a 23
    total_neto NUMERIC(12, 2) DEFAULT 0.00,    -- Subtotal sin IVA
    total_iva NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    salonero TEXT,
    codcliente TEXT,
    numcierre INT,
    tipo_documento TEXT DEFAULT 'TICKET',      -- 'TICKET', 'FACTURA', 'NOTA_CREDITO'
    origen_icg_id TEXT,                        -- Referencia combinada (ej: 'S1-T1-10023')
    creado_en_icg TIMESTAMPTZ,
    sincronizado_el TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_venta_icg UNIQUE(empresa_id, sucursal_id, serie, numero)
);

-- 7. TABLA DE VENTAS (DETALLE / LÍNEAS)
CREATE TABLE IF NOT EXISTS public.ventas_detalle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID NOT NULL REFERENCES public.ventas_cabecera(id) ON DELETE CASCADE,
    numlinea INT NOT NULL,
    codarticulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    unidades NUMERIC(10, 3) NOT NULL DEFAULT 1.000,
    precio NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Precio sin IVA
    precio_con_iva NUMERIC(12, 2) DEFAULT 0.00,
    total_linea NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tipo_iva NUMERIC(5, 2) DEFAULT 0.00,
    codseccion TEXT,
    coddepartamento TEXT,
    CONSTRAINT uq_linea_venta UNIQUE(venta_id, numlinea)
);

-- 8. TABLA DE FORMAS DE PAGO POR VENTA
CREATE TABLE IF NOT EXISTS public.ventas_pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID NOT NULL REFERENCES public.ventas_cabecera(id) ON DELETE CASCADE,
    numlinea INT NOT NULL DEFAULT 1,
    codformapago TEXT NOT NULL,                 -- Ej: '1' Efectivo, '2' Tarjeta, 'YAPPY'
    descripcion_pago TEXT NOT NULL,
    importe NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    propina NUMERIC(12, 2) DEFAULT 0.00,
    CONSTRAINT uq_pago_venta UNIQUE(venta_id, numlinea)
);

-- 9. TABLA DE CIERRES DE CAJA (CORTE Z / RESUMEN X)
CREATE TABLE IF NOT EXISTS public.cierres_caja (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id TEXT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    sucursal_id TEXT NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    caja_id TEXT,
    numcierre INT NOT NULL,
    fecha_apertura TIMESTAMPTZ,
    fecha_cierre TIMESTAMPTZ NOT NULL,
    total_ventas NUMERIC(12, 2) DEFAULT 0.00,
    total_efectivo NUMERIC(12, 2) DEFAULT 0.00,
    total_tarjeta NUMERIC(12, 2) DEFAULT 0.00,
    total_otros NUMERIC(12, 2) DEFAULT 0.00,
    total_propina NUMERIC(12, 2) DEFAULT 0.00,
    diferencia NUMERIC(12, 2) DEFAULT 0.00,
    sincronizado_el TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_cierre_icg UNIQUE(empresa_id, sucursal_id, caja_id, numcierre)
);

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO (OPTIMIZACIÓN CONSULTAS TIPO POWER BI)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_ventas_empresa_fecha ON public.ventas_cabecera(empresa_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_sucursal_fecha ON public.ventas_cabecera(sucursal_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_hora ON public.ventas_cabecera(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_detalle_venta ON public.ventas_detalle(venta_id);
CREATE INDEX IF NOT EXISTS idx_ventas_detalle_articulo ON public.ventas_detalle(codarticulo);
CREATE INDEX IF NOT EXISTS idx_ventas_pagos_venta ON public.ventas_pagos(venta_id);
CREATE INDEX IF NOT EXISTS idx_heartbeat_ping ON public.sucursales_heartbeat(ultimo_ping DESC);

-- ==============================================================================
-- VISTAS ANALÍTICAS PARA EL DASHBOARD EJECUTIVO
-- ==============================================================================

-- Vista 1: Resumen Diario por Sucursal
CREATE OR REPLACE VIEW public.v_resumen_diario_sucursal AS
SELECT 
    v.empresa_id,
    v.sucursal_id,
    s.nombre AS sucursal_nombre,
    v.fecha,
    COUNT(v.id) AS total_tickets,
    SUM(v.total_neto) AS total_neto,
    SUM(v.total_iva) AS total_iva,
    SUM(v.total) AS total_ventas,
    ROUND(AVG(v.total), 2) AS ticket_promedio
FROM public.ventas_cabecera v
JOIN public.sucursales s ON s.id = v.sucursal_id
GROUP BY v.empresa_id, v.sucursal_id, s.nombre, v.fecha;

-- Vista 2: Métodos de Pago Consolidados
CREATE OR REPLACE VIEW public.v_metodos_pago_resumen AS
SELECT 
    v.empresa_id,
    v.sucursal_id,
    v.fecha,
    p.codformapago,
    p.descripcion_pago,
    COUNT(p.id) AS transacciones,
    SUM(p.importe) AS total_importe,
    SUM(p.propina) AS total_propina
FROM public.ventas_pagos p
JOIN public.ventas_cabecera v ON v.id = p.venta_id
GROUP BY v.empresa_id, v.sucursal_id, v.fecha, p.codformapago, p.descripcion_pago;

-- Vista 3: Top Artículos Vendidos
CREATE OR REPLACE VIEW public.v_top_articulos AS
SELECT 
    v.empresa_id,
    v.sucursal_id,
    v.fecha,
    d.codarticulo,
    d.descripcion,
    SUM(d.unidades) AS total_unidades,
    SUM(d.total_linea) AS total_importe
FROM public.ventas_detalle d
JOIN public.ventas_cabecera v ON v.id = d.venta_id
GROUP BY v.empresa_id, v.sucursal_id, v.fecha, d.codarticulo, d.descripcion;

-- Vista 4: Distribución de Ventas por Hora (Curva de Tráfico)
CREATE OR REPLACE VIEW public.v_ventas_por_hora AS
SELECT 
    v.empresa_id,
    v.sucursal_id,
    v.fecha,
    v.hora,
    COUNT(v.id) AS total_tickets,
    SUM(v.total) AS total_ventas
FROM public.ventas_cabecera v
GROUP BY v.empresa_id, v.sucursal_id, v.fecha, v.hora;

-- ==============================================================================
-- FUNCIÓN RPC PARA REPORTES Y FILTROS RÁPIDOS DESDE VERCEL
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_dashboard_kpis(
    p_empresa_id TEXT,
    p_fecha_desde DATE,
    p_fecha_hasta DATE,
    p_sucursal_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_ventas NUMERIC(12,2) := 0;
    v_total_neto NUMERIC(12,2) := 0;
    v_total_tickets BIGINT := 0;
    v_ticket_promedio NUMERIC(12,2) := 0;
    v_resultado JSONB;
BEGIN
    SELECT 
        COALESCE(SUM(total), 0),
        COALESCE(SUM(total_neto), 0),
        COALESCE(COUNT(*), 0),
        CASE WHEN COUNT(*) > 0 THEN ROUND(COALESCE(SUM(total), 0) / COUNT(*), 2) ELSE 0 END
    INTO 
        v_total_ventas,
        v_total_neto,
        v_total_tickets,
        v_ticket_promedio
    FROM public.ventas_cabecera
    WHERE empresa_id = p_empresa_id
      AND fecha >= p_fecha_desde
      AND fecha <= p_fecha_hasta
      AND (p_sucursal_id IS NULL OR p_sucursal_id = '' OR sucursal_id = p_sucursal_id);

    v_resultado := jsonb_build_object(
        'total_ventas', v_total_ventas,
        'total_neto', v_total_neto,
        'total_tickets', v_total_tickets,
        'ticket_promedio', v_ticket_promedio,
        'fecha_desde', p_fecha_desde,
        'fecha_hasta', p_fecha_hasta,
        'sucursal_id', p_sucursal_id
    );

    RETURN v_resultado;
END;
$$;

-- ==============================================================================
-- DATOS SEMILLA PARA EL ESCENARIO GOYURT
-- ==============================================================================
INSERT INTO public.empresas (id, nombre, ruc) 
VALUES ('goyurt', 'GOYURT PANAMÁ', '155700000-2-2024')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.sucursales (id, empresa_id, codigo, nombre, direccion) 
VALUES 
    ('goyurt-suc-01', 'goyurt', '01', 'GOYURT - Sucursal 1 (Local A)', 'Centro Comercial 1, Local 14'),
    ('goyurt-suc-02', 'goyurt', '02', 'GOYURT - Sucursal 2 (Local B)', 'Centro Comercial 2, Kiosco K-02')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.cajas (id, sucursal_id, codigo_caja, descripcion, serie_asignada)
VALUES 
    ('caja-goyurt-01-01', 'goyurt-suc-01', 'CAJA1', 'Caja Principal - Sucursal 1', 'T1'),
    ('caja-goyurt-02-01', 'goyurt-suc-02', 'CAJA1', 'Caja Principal - Sucursal 2', 'T1')
ON CONFLICT (id) DO NOTHING;
