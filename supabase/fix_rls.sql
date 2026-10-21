-- ==============================================================================
-- ICONWEBCONECT-CENTRAL 🌐
-- Políticas de Seguridad / Permisos para Frontend (Vercel) y Agentes Locales
-- Ejecuta este script en el SQL Editor de Supabase
-- ==============================================================================

-- Opción Recomendada: Deshabilitar RLS temporalmente o habilitar políticas abiertas
-- para permitir lectura desde el dashboard (Vercel con Anon Key) y escritura desde agentes.

ALTER TABLE IF EXISTS public.empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sucursales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cajas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sucursales_heartbeat DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ventas_cabecera DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ventas_detalle DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ventas_pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cierres_caja DISABLE ROW LEVEL SECURITY;

-- Re-insertar datos iniciales de GOYURT
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
