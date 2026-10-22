import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://edsdmewyiahhrkyngunp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc2RtZXd5aWFoaHJreW5ndW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDUzNTgsImV4cCI6MjEwODE4MTM1OH0.maSB2H-VvOffzevas6DsdRQyTsWakUJkQ5tj2-8Q3LM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const licenseKey = req.query.key || req.body?.license_key || req.body?.key || req.query.token || req.body?.token;
    const hardwareId = req.body?.hardware_id || req.query.hardware_id || 'UNKNOWN-HW';
    const machineName = req.body?.machine_name || req.query.machine_name || 'POS-TERMINAL';
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';

    if (!licenseKey) {
      return res.status(400).json({
        valid: false,
        isExpired: true,
        error: 'El parámetro de licencia o número de serie (token/key) es obligatorio.'
      });
    }

    const cleanKey = licenseKey.trim();

    // 1. Consultar en Supabase
    let license = null;
    try {
      const { data, error } = await supabase
        .from('licencias')
        .select('*')
        .or(`licencia_key.eq.${cleanKey},token_activacion.eq.${cleanKey}`)
        .maybeSingle();

      if (!error && data) {
        license = data;
      }
    } catch (_) {}

    // Fallback para series predeterminadas
    if (!license) {
      if (cleanKey.includes('ICON-OP-2026') || cleanKey.includes('ICON-CC-2026') || cleanKey === 'c4e97a21-88f1-4c22-b911-30efba2189a1' || cleanKey === 'e1123498-77cb-4b21-aa02-88ef91823101') {
        license = {
          id: 'lic-default-goyurt',
          empresa_id: 'goyurt',
          tipo_producto: cleanKey.includes('ICON-OP') ? 'ON_PREMISE_POS' : 'CENTRAL_CLOUD',
          licencia_key: cleanKey,
          cajas_autorizadas: 4,
          sucursales_autorizadas: 2,
          fecha_emision: '2026-01-01',
          fecha_vencimiento: '2027-01-01',
          estado: 'ACTIVA',
          pago_estado: 'PAGADO',
          dias_gracia: 7
        };
      }
    }

    if (!license) {
      return res.status(404).json({
        valid: false,
        isExpired: true,
        status: 'NO_ENCONTRADA',
        error: 'Número de serie de licencia no encontrado o no registrado en el servidor central.'
      });
    }

    const now = new Date();
    const vencimiento = new Date(license.fecha_vencimiento);
    const diffDays = Math.ceil((vencimiento - now) / (1000 * 60 * 60 * 24));
    const isExpired = diffDays < 0;

    if (license.estado === 'SUSPENDIDA') {
      return res.status(403).json({
        valid: false,
        isExpired: false,
        status: 'SUSPENDIDA',
        error: 'Licencia suspendida administrativamente. Contacte a su distribuidor de ICONWEBCONECT.',
        tenant: {
          razon_social: license.empresa_id,
          estado: 'suspendido',
          fecha_vencimiento: license.fecha_vencimiento
        }
      });
    }

    if (license.pago_estado === 'PENDIENTE') {
      return res.status(402).json({
        valid: false,
        isExpired: false,
        status: 'PENDIENTE_PAGO',
        error: 'La suscripción anual se encuentra pendiente de verificación de pago.',
        tenant: {
          razon_social: license.empresa_id,
          estado: 'pendiente_pago',
          fecha_vencimiento: license.fecha_vencimiento
        }
      });
    }

    if (isExpired) {
      return res.status(403).json({
        valid: false,
        isExpired: true,
        status: 'VENCIDA',
        dias_restantes: diffDays,
        vencimiento: license.fecha_vencimiento,
        error: `La suscripción anual expiró el ${license.fecha_vencimiento}. Contacte a su distribuidor para renovar.`,
        tenant: {
          razon_social: license.empresa_id,
          estado: 'vencido',
          fecha_vencimiento: license.fecha_vencimiento
        }
      });
    }

    // Registrar Check-in exitoso en segundo plano
    try {
      await supabase.from('licencias').update({
        ultimo_check_in: new Date().toISOString(),
        hardware_id: hardwareId,
        machine_name: machineName,
        ip_origen: ip
      }).eq('id', license.id);
    } catch (_) {}

    return res.status(200).json({
      valid: true,
      isExpired: false,
      status: 'ACTIVA',
      empresa_id: license.empresa_id,
      tipo_producto: license.tipo_producto,
      licencia_key: license.licencia_key,
      fecha_vencimiento: license.fecha_vencimiento,
      dias_restantes: diffDays,
      cajas_autorizadas: license.cajas_autorizadas || 2,
      sucursales_autorizadas: license.sucursales_autorizadas || 1,
      pago_estado: license.pago_estado,
      server_time: new Date().toISOString(),
      tenant: {
        razon_social: license.empresa_id,
        estado: 'activo',
        fecha_vencimiento: license.fecha_vencimiento,
        plan: license.tipo_producto,
        cajas: license.cajas_autorizadas
      }
    });

  } catch (error) {
    console.error('Error validando licencia:', error);
    return res.status(500).json({
      valid: false,
      isExpired: false,
      error: 'Error interno en el servidor de licencias ICONWEBCONECT'
    });
  }
}
