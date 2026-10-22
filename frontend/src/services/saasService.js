import { supabase } from '../lib/supabaseClient';

// Claves de persistencia local para fallback offline / sin tablas Supabase
const LOCAL_STORAGE_DISTRIBUTORS_KEY = 'iconweb_saas_distribuidores_v1';
const LOCAL_STORAGE_CLIENTS_KEY = 'iconweb_saas_clientes_v1';
const LOCAL_STORAGE_LICENSES_KEY = 'iconweb_saas_licencias_v1';

// Seed inicial predeterminado
const DEFAULT_DISTRIBUTORS = [
  {
    id: 'dist-abba',
    nombre: 'ABBA INNOVATION S.A.',
    ruc: '155773714-2-2025',
    email: 'soporte@abbainnovation.com',
    telefono: '+507 6000-0000',
    contacto_principal: 'Alejandro Barranco',
    comision_pct: 25,
    estado: 'activo',
    creado_el: '2026-01-15T00:00:00Z'
  },
  {
    id: 'dist-grupovev',
    nombre: 'GRUPO VEV, S.A.',
    ruc: '155700000-2-2024',
    email: 'ventas@grupovev.com',
    telefono: '+507 6111-1111',
    contacto_principal: 'Gerencia Comercial',
    comision_pct: 30,
    estado: 'activo',
    creado_el: '2026-01-10T00:00:00Z'
  }
];

const DEFAULT_CLIENTS = [
  {
    id: 'goyurt',
    nombre: 'GOYURT PANAMÁ',
    ruc: '155700000-2-2024',
    distribuidor_id: 'dist-abba',
    distribuidor_nombre: 'ABBA INNOVATION S.A.',
    email: 'administracion@goyurt.com.pa',
    telefono: '+507 390-1234',
    cajas_contratadas: 4,
    sucursales_count: 2,
    tipo_suscripcion: 'ANUAL',
    tipo_producto: 'COMBO', // Central Cloud + On-Premise
    plan_nombre: 'Combo Cloud + On-Premise (Anual)',
    estado: 'activo',
    fecha_emision: '2026-01-01',
    fecha_vencimiento: '2027-01-01',
    logo_url: '/goyurt-logo.png'
  },
  {
    id: 'rest-trapiche',
    nombre: 'RESTAURANTE EL TRAPICHE',
    ruc: '8-800-12345 DV 90',
    distribuidor_id: 'dist-grupovev',
    distribuidor_nombre: 'GRUPO VEV, S.A.',
    email: 'contacto@eltrapichepanama.com',
    telefono: '+507 269-4353',
    cajas_contratadas: 2,
    sucursales_count: 1,
    tipo_suscripcion: 'ANUAL',
    tipo_producto: 'ON_PREMISE_POS',
    plan_nombre: 'ICONWEBCONECT On-Premise FrontRest (Anual)',
    estado: 'activo',
    fecha_emision: '2026-02-15',
    fecha_vencimiento: '2027-02-15',
    logo_url: null
  }
];

const DEFAULT_LICENSES = [
  {
    id: 'lic-goyurt-cloud-01',
    empresa_id: 'goyurt',
    empresa_nombre: 'GOYURT PANAMÁ',
    distribuidor_id: 'dist-abba',
    distribuidor_nombre: 'ABBA INNOVATION S.A.',
    tipo_producto: 'CENTRAL_CLOUD',
    licencia_key: 'ICON-CC-2026-GOYURT-PANAMA-9A1B',
    token_activacion: 'c4e97a21-88f1-4c22-b911-30efba2189a1',
    cajas_autorizadas: 10,
    sucursales_autorizadas: 5,
    fecha_emision: '2026-01-01',
    fecha_vencimiento: '2027-01-01',
    dias_gracia: 7,
    estado: 'ACTIVA',
    pago_estado: 'PAGADO',
    monto_anual: 360.00,
    moneda: 'USD',
    hardware_id: 'SRV-CLOUD-GOYURT-01',
    machine_name: 'GOYURT-CENTRAL-NODE',
    ultimo_check_in: new Date().toISOString()
  },
  {
    id: 'lic-goyurt-pos-01',
    empresa_id: 'goyurt',
    empresa_nombre: 'GOYURT PANAMÁ',
    distribuidor_id: 'dist-abba',
    distribuidor_nombre: 'ABBA INNOVATION S.A.',
    tipo_producto: 'ON_PREMISE_POS',
    licencia_key: 'ICON-OP-2026-8F42-99B1-7C4E',
    token_activacion: 'e1123498-77cb-4b21-aa02-88ef91823101',
    cajas_autorizadas: 2,
    sucursales_autorizadas: 1,
    fecha_emision: '2026-01-01',
    fecha_vencimiento: '2027-01-01',
    dias_gracia: 7,
    estado: 'ACTIVA',
    pago_estado: 'PAGADO',
    monto_anual: 240.00,
    moneda: 'USD',
    hardware_id: 'PC-GRUPOVEV-TPV01',
    machine_name: 'CAJA-MULTIPLAZA-01',
    ultimo_check_in: new Date().toISOString()
  },
  {
    id: 'lic-trapiche-pos-01',
    empresa_id: 'rest-trapiche',
    empresa_nombre: 'RESTAURANTE EL TRAPICHE',
    distribuidor_id: 'dist-grupovev',
    distribuidor_nombre: 'GRUPO VEV, S.A.',
    tipo_producto: 'ON_PREMISE_POS',
    licencia_key: 'ICON-OP-2026-TRAP-88A2-33C1',
    token_activacion: 'f9918234-11cb-4b21-ff99-123456789abc',
    cajas_autorizadas: 2,
    sucursales_autorizadas: 1,
    fecha_emision: '2026-02-15',
    fecha_vencimiento: '2027-02-15',
    dias_gracia: 7,
    estado: 'ACTIVA',
    pago_estado: 'PAGADO',
    monto_anual: 240.00,
    moneda: 'USD',
    hardware_id: 'PC-TRAPICHE-SERVER',
    machine_name: 'SRV-FRONTREST',
    ultimo_check_in: new Date().toISOString()
  }
];

// Generador de Números de Serie Criptográficos / Estructurados
export function generateLicenseKey(tipoProducto = 'ON_PREMISE_POS') {
  const prefix = tipoProducto === 'CENTRAL_CLOUD' ? 'ICON-CC' : (tipoProducto === 'COMBO' ? 'ICON-CB' : 'ICON-OP');
  const year = new Date().getFullYear();
  const randSegment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${year}-${randSegment()}-${randSegment()}-${randSegment()}`;
}

export const saasService = {
  // ==============================================================
  // 1. DISTRIBUIDORES
  // ==============================================================
  async getDistributors() {
    try {
      const { data, error } = await supabase
        .from('distribuidores')
        .select('*')
        .order('nombre');

      if (!error && data && data.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_DISTRIBUTORS_KEY, JSON.stringify(data));
        return data;
      }
    } catch (_) {}

    // Fallback Local
    const raw = localStorage.getItem(LOCAL_STORAGE_DISTRIBUTORS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_DISTRIBUTORS_KEY, JSON.stringify(DEFAULT_DISTRIBUTORS));
      return DEFAULT_DISTRIBUTORS;
    }
    return JSON.parse(raw);
  },

  async saveDistributor(dist) {
    const isEdit = !!dist.id;
    const distData = {
      ...dist,
      id: dist.id || `dist-${dist.nombre.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12)}-${Math.floor(Math.random() * 899 + 100)}`,
      comision_pct: Number(dist.comision_pct) || 20,
      estado: dist.estado || 'activo',
      actualizado_el: new Date().toISOString()
    };

    try {
      if (isEdit) {
        await supabase.from('distribuidores').update(distData).eq('id', distData.id);
      } else {
        await supabase.from('distribuidores').insert([distData]);
      }
    } catch (_) {}

    // Guardar en local storage
    const current = await this.getDistributors();
    let updated;
    if (isEdit) {
      updated = current.map(d => d.id === distData.id ? { ...d, ...distData } : d);
    } else {
      updated = [distData, ...current];
    }
    localStorage.setItem(LOCAL_STORAGE_DISTRIBUTORS_KEY, JSON.stringify(updated));
    return distData;
  },

  async deleteDistributor(id) {
    try {
      await supabase.from('distribuidores').delete().eq('id', id);
    } catch (_) {}
    const current = await this.getDistributors();
    const filtered = current.filter(d => d.id !== id);
    localStorage.setItem(LOCAL_STORAGE_DISTRIBUTORS_KEY, JSON.stringify(filtered));
    return true;
  },

  // ==============================================================
  // 2. CLIENTES FINALES / TENANTS
  // ==============================================================
  async getClients(distributorId = null) {
    let clients = [];
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nombre');

      if (!error && data && data.length > 0) {
        clients = data;
        localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(data));
      }
    } catch (_) {}

    if (clients.length === 0) {
      const raw = localStorage.getItem(LOCAL_STORAGE_CLIENTS_KEY);
      if (!raw) {
        localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(DEFAULT_CLIENTS));
        clients = DEFAULT_CLIENTS;
      } else {
        clients = JSON.parse(raw);
      }
    }

    // Filtrar por distribuidor si aplica (Modo Portal Distribuidor)
    if (distributorId) {
      return clients.filter(c => c.distribuidor_id === distributorId);
    }
    return clients;
  },

  async saveClient(client) {
    const isEdit = !!client.id;
    const clientId = client.id || client.nombre.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 16);
    
    // Calcular vencimiento a 1 año si es nueva suscripción anual
    const fechaEmision = client.fecha_emision || new Date().toISOString().split('T')[0];
    const emisionDate = new Date(fechaEmision);
    const vencimientoDate = new Date(emisionDate);
    vencimientoDate.setFullYear(vencimientoDate.getFullYear() + 1);
    const fechaVencimiento = client.fecha_vencimiento || vencimientoDate.toISOString().split('T')[0];

    const clientData = {
      ...client,
      id: clientId,
      cajas_contratadas: Number(client.cajas_contratadas) || 2,
      sucursales_count: Number(client.sucursales_count) || 1,
      tipo_suscripcion: client.tipo_suscripcion || 'ANUAL',
      tipo_producto: client.tipo_producto || 'CENTRAL_CLOUD',
      estado: client.estado || 'activo',
      fecha_emision: fechaEmision,
      fecha_vencimiento: fechaVencimiento,
      actualizado_el: new Date().toISOString()
    };

    try {
      if (isEdit) {
        await supabase.from('empresas').update(clientData).eq('id', clientId);
      } else {
        await supabase.from('empresas').insert([clientData]);
      }
    } catch (_) {}

    const current = await this.getClients();
    let updated;
    if (isEdit) {
      updated = current.map(c => c.id === clientId ? { ...c, ...clientData } : c);
    } else {
      updated = [clientData, ...current];
    }
    localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(updated));

    // Si es cliente nuevo y se eligió producto On-Premise o Central, generar automáticamente su licencia anual
    if (!isEdit) {
      await this.generateLicenseForClient(clientData);
    }

    return clientData;
  },

  // ==============================================================
  // 3. GESTOR DE LICENCIAS Y SERIES
  // ==============================================================
  async getLicenses(empresaId = null, distributorId = null) {
    let licenses = [];
    try {
      const { data, error } = await supabase
        .from('licencias')
        .select('*')
        .order('creado_el', { ascending: false });

      if (!error && data && data.length > 0) {
        licenses = data;
        localStorage.setItem(LOCAL_STORAGE_LICENSES_KEY, JSON.stringify(data));
      }
    } catch (_) {}

    if (licenses.length === 0) {
      const raw = localStorage.getItem(LOCAL_STORAGE_LICENSES_KEY);
      if (!raw) {
        localStorage.setItem(LOCAL_STORAGE_LICENSES_KEY, JSON.stringify(DEFAULT_LICENSES));
        licenses = DEFAULT_LICENSES;
      } else {
        licenses = JSON.parse(raw);
      }
    }

    if (empresaId) {
      licenses = licenses.filter(l => l.empresa_id === empresaId);
    }
    if (distributorId) {
      licenses = licenses.filter(l => l.distribuidor_id === distributorId);
    }

    return licenses;
  },

  async generateLicenseForClient(clientData) {
    const isCombo = clientData.tipo_producto === 'COMBO';
    const productsToIssue = isCombo ? ['CENTRAL_CLOUD', 'ON_PREMISE_POS'] : [clientData.tipo_producto || 'CENTRAL_CLOUD'];

    const newLicenses = [];
    for (const prod of productsToIssue) {
      const key = generateLicenseKey(prod);
      const licObj = {
        id: `lic-${clientData.id}-${prod.toLowerCase().substring(0, 3)}-${Date.now().toString(36)}`,
        empresa_id: clientData.id,
        empresa_nombre: clientData.nombre,
        distribuidor_id: clientData.distribuidor_id,
        distribuidor_nombre: clientData.distribuidor_nombre || 'ABBA INNOVATION S.A.',
        tipo_producto: prod,
        licencia_key: key,
        token_activacion: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + '-' + Date.now(),
        cajas_autorizadas: clientData.cajas_contratadas || 2,
        sucursales_autorizadas: clientData.sucursales_count || 1,
        fecha_emision: clientData.fecha_emision || new Date().toISOString().split('T')[0],
        fecha_vencimiento: clientData.fecha_vencimiento || new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0],
        dias_gracia: 7,
        estado: 'ACTIVA',
        pago_estado: 'PAGADO',
        monto_anual: prod === 'CENTRAL_CLOUD' ? 360.00 : 240.00,
        moneda: 'USD',
        hardware_id: null,
        machine_name: null,
        ultimo_check_in: null
      };

      try {
        await supabase.from('licencias').insert([licObj]);
      } catch (_) {}

      newLicenses.push(licObj);
    }

    const currentLicenses = await this.getLicenses();
    const updatedLicenses = [...newLicenses, ...currentLicenses];
    localStorage.setItem(LOCAL_STORAGE_LICENSES_KEY, JSON.stringify(updatedLicenses));
    return newLicenses;
  },

  async renewLicense(licenseId, additionalYears = 1) {
    const licenses = await this.getLicenses();
    const lic = licenses.find(l => l.id === licenseId);
    if (!lic) return null;

    const baseDate = new Date(lic.fecha_vencimiento) > new Date() ? new Date(lic.fecha_vencimiento) : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + additionalYears);
    const newVencimiento = baseDate.toISOString().split('T')[0];

    const updatedLic = {
      ...lic,
      fecha_vencimiento: newVencimiento,
      estado: 'ACTIVA',
      pago_estado: 'PAGADO',
      actualizado_el: new Date().toISOString()
    };

    try {
      await supabase.from('licencias').update({
        fecha_vencimiento: newVencimiento,
        estado: 'ACTIVA',
        pago_estado: 'PAGADO'
      }).eq('id', licenseId);
    } catch (_) {}

    const updatedList = licenses.map(l => l.id === licenseId ? updatedLic : l);
    localStorage.setItem(LOCAL_STORAGE_LICENSES_KEY, JSON.stringify(updatedList));

    // También actualizar la fecha de vencimiento en la empresa
    try {
      const clients = await this.getClients();
      const client = clients.find(c => c.id === lic.empresa_id);
      if (client) {
        client.fecha_vencimiento = newVencimiento;
        client.estado = 'activo';
        localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(clients));
      }
    } catch (_) {}

    return updatedLic;
  },

  async toggleLicenseStatus(licenseId) {
    const licenses = await this.getLicenses();
    const lic = licenses.find(l => l.id === licenseId);
    if (!lic) return null;

    const nextEstado = lic.estado === 'ACTIVA' ? 'SUSPENDIDA' : 'ACTIVA';
    const updatedLic = {
      ...lic,
      estado: nextEstado,
      actualizado_el: new Date().toISOString()
    };

    try {
      await supabase.from('licencias').update({ estado: nextEstado }).eq('id', licenseId);
    } catch (_) {}

    const updatedList = licenses.map(l => l.id === licenseId ? updatedLic : l);
    localStorage.setItem(LOCAL_STORAGE_LICENSES_KEY, JSON.stringify(updatedList));
    return updatedLic;
  },

  // ==============================================================
  // 4. SIMULADOR / VERIFICADOR DE LICENCIA EN LÍNEA (CLIENT-SIDE)
  // ==============================================================
  async validateLicenseOnline(licenseKey, hardwareId = 'SIM-PC-01', machineName = 'SIMULADOR-TPV') {
    const keyClean = (licenseKey || '').trim();
    if (!keyClean) {
      return { valid: false, error: 'Debe ingresar una licencia o número de serie.' };
    }

    const licenses = await this.getLicenses();
    const found = licenses.find(l => l.licencia_key === keyClean || l.token_activacion === keyClean);

    if (!found) {
      return {
        valid: false,
        error: 'Licencia no encontrada en el servidor central o clave inválida.'
      };
    }

    const now = new Date();
    const vencimiento = new Date(found.fecha_vencimiento);
    const diffDays = Math.ceil((vencimiento - now) / (1000 * 60 * 60 * 24));
    const isExpired = diffDays < 0;

    if (found.estado === 'SUSPENDIDA') {
      return {
        valid: false,
        status: 'SUSPENDIDA',
        error: 'La licencia se encuentra suspendida por el distribuidor o administrador general.'
      };
    }

    if (found.pago_estado === 'PENDIENTE') {
      return {
        valid: false,
        status: 'PENDIENTE_PAGO',
        error: 'La suscripción anual se encuentra pendiente de verificación de pago.'
      };
    }

    if (isExpired) {
      return {
        valid: false,
        status: 'VENCIDA',
        dias_restantes: diffDays,
        vencimiento: found.fecha_vencimiento,
        error: `La suscripción anual venció el ${found.fecha_vencimiento}. Contacte a su distribuidor autorizado para su renovación.`
      };
    }

    // Actualizar último check-in
    found.ultimo_check_in = new Date().toISOString();
    found.hardware_id = hardwareId;
    found.machine_name = machineName;
    localStorage.setItem(LOCAL_STORAGE_LICENSES_KEY, JSON.stringify(licenses));

    return {
      valid: true,
      status: 'ACTIVA',
      empresa: found.empresa_nombre,
      empresa_id: found.empresa_id,
      distribuidor: found.distribuidor_nombre,
      tipo_producto: found.tipo_producto,
      licencia_key: found.licencia_key,
      fecha_vencimiento: found.fecha_vencimiento,
      dias_restantes: diffDays,
      cajas_autorizadas: found.cajas_autorizadas,
      sucursales_autorizadas: found.sucursales_autorizadas,
      pago_estado: found.pago_estado,
      mensaje: `Licencia Activa válida hasta ${found.fecha_vencimiento} (${diffDays} días restantes).`
    };
  }
};
