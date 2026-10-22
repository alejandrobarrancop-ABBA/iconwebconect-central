import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Key, 
  ShieldCheck, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Laptop, 
  Cloud, 
  Server, 
  ExternalLink,
  Edit2,
  Trash2,
  Shield,
  ArrowRight
} from 'lucide-react';
import { saasService, generateLicenseKey } from '../../services/saasService';

export default function SaasAdminDashboard({ 
  currentUser, 
  onSwitchTenant, 
  activeTenantId,
  isDistributorMode = false 
}) {
  const [subTab, setSubTab] = useState(isDistributorMode ? 'clients' : 'overview');
  const [distributors, setDistributors] = useState([]);
  const [clients, setClients] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modales
  const [showDistModal, setShowDistModal] = useState(false);
  const [distForm, setDistForm] = useState({ id: '', nombre: '', ruc: '', email: '', telefono: '', contacto_principal: '', comision_pct: 25, estado: 'activo' });

  const [showClientModal, setShowClientModal] = useState(false);
  const [clientForm, setClientForm] = useState({ 
    id: '', 
    nombre: '', 
    ruc: '', 
    distribuidor_id: isDistributorMode ? currentUser?.id || 'dist-abba' : 'dist-abba',
    email: '', 
    telefono: '', 
    cajas_contratadas: 2, 
    sucursales_count: 1, 
    tipo_producto: 'ON_PREMISE_POS', 
    tipo_suscripcion: 'ANUAL', 
    estado: 'activo' 
  });

  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseForm, setLicenseForm] = useState({
    empresa_id: '',
    tipo_producto: 'ON_PREMISE_POS',
    cajas_autorizadas: 2,
    sucursales_autorizadas: 1,
    pago_estado: 'PAGADO',
    monto_anual: 240
  });

  // Simulador de Validación Online
  const [testKey, setTestKey] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // Carga de datos
  const loadAll = async () => {
    setLoading(true);
    try {
      const [distsData, clientsData, licsData] = await Promise.all([
        saasService.getDistributors(),
        saasService.getClients(isDistributorMode ? currentUser?.distribuidor_id || currentUser?.id : null),
        saasService.getLicenses(null, isDistributorMode ? currentUser?.distribuidor_id || currentUser?.id : null)
      ]);
      setDistributors(distsData || []);
      setClients(clientsData || []);
      setLicenses(licsData || []);
      if (licsData && licsData.length > 0 && !testKey) {
        setTestKey(licsData[0].licencia_key);
      }
    } catch (err) {
      console.error('Error cargando datos SaaS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [isDistributorMode]);

  // Cálculos de KPIs
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.estado === 'activo').length;
  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter(l => l.estado === 'ACTIVA').length;
  const onPremiseCount = licenses.filter(l => l.tipo_producto === 'ON_PREMISE_POS').length;
  const cloudCount = licenses.filter(l => l.tipo_producto === 'CENTRAL_CLOUD').length;
  const totalRevenue = licenses.reduce((sum, l) => sum + (Number(l.monto_anual) || 0), 0);

  // Copiar clave
  const copyToClipboard = (text, label = 'Serie') => {
    navigator.clipboard.writeText(text);
    alert(`¡${label} copiado al portapapeles! 📋\n${text}`);
  };

  // Guardar Distribuidor
  const handleSaveDistributor = async (e) => {
    e.preventDefault();
    if (!distForm.nombre) return;
    await saasService.saveDistributor(distForm);
    setShowDistModal(false);
    setDistForm({ id: '', nombre: '', ruc: '', email: '', telefono: '', contacto_principal: '', comision_pct: 25, estado: 'activo' });
    loadAll();
  };

  // Guardar Cliente Final y emitir Licencia Anual
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!clientForm.nombre) return;
    const dist = distributors.find(d => d.id === clientForm.distribuidor_id);
    await saasService.saveClient({
      ...clientForm,
      distribuidor_nombre: dist ? dist.nombre : 'ABBA INNOVATION S.A.'
    });
    setShowClientModal(false);
    setClientForm({ 
      id: '', 
      nombre: '', 
      ruc: '', 
      distribuidor_id: isDistributorMode ? currentUser?.id || 'dist-abba' : 'dist-abba',
      email: '', 
      telefono: '', 
      cajas_contratadas: 2, 
      sucursales_count: 1, 
      tipo_producto: 'ON_PREMISE_POS', 
      tipo_suscripcion: 'ANUAL', 
      estado: 'activo' 
    });
    loadAll();
  };

  // Renovar Licencia 1 Año
  const handleRenew = async (licId) => {
    if (window.confirm('¿Desea renovar esta suscripción anual por 1 año adicional (+365 días)?')) {
      await saasService.renewLicense(licId, 1);
      loadAll();
      alert('¡Suscripción renovada exitosamente por 1 año adicional!');
    }
  };

  // Alternar Estado de Licencia (Activar / Suspender)
  const handleToggleLic = async (licId) => {
    await saasService.toggleLicenseStatus(licId);
    loadAll();
  };

  // Probar Validación Online
  const handleTestValidation = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await saasService.validateLicenseOnline(testKey, 'SIM-PC-MEZEGREEK-01', 'PC-GRUPOVEV-TPV01');
      setTestResult(res);
    } catch (err) {
      setTestResult({ valid: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ============================================================== */}
      {/* CABECERA PRINCIPAL DEL PANEL SAAS                              */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 border border-teal-300">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {isDistributorMode ? 'Portal Distribuidor Autorizado' : 'Consola Central SuperAdmin SaaS'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                {isDistributorMode ? 'Canal Reseller' : 'Grupo VEV / ABBA Global'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Gestión multi-tenant, emisión de series On-Premise y validación online en tiempo real
            </p>
          </div>
        </div>

        {/* Botones de Acción Rápida */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => { setClientForm(prev => ({ ...prev, id: '' })); setShowClientModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-black rounded-xl shadow-sm shadow-teal-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Crear Cliente Final</span>
          </button>

          {!isDistributorMode && (
            <button
              onClick={() => { setDistForm({ id: '', nombre: '', ruc: '', email: '', telefono: '', contacto_principal: '', comision_pct: 25, estado: 'activo' }); setShowDistModal(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-200"
            >
              <Users className="w-4 h-4 text-slate-600" />
              <span>+ Nuevo Distribuidor</span>
            </button>
          )}

          <button
            onClick={loadAll}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* KPI CARDS (RESUMEN EN 100% BLANCO CON ACENTOS TURQUESA)        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Clientes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Clientes Finales</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalClients}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {activeClients} Activos
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-tenant con ICG FrontRest</p>
        </div>

        {/* KPI 2: Licencias On-Premise */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Series On-Premise</span>
            <Laptop className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{onPremiseCount}</span>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              TPV Local
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Instalaciones locales activas</p>
        </div>

        {/* KPI 3: Licencias Cloud */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Suscripciones Central</span>
            <Cloud className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{cloudCount}</span>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Web Cloud
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consolidación multi-sucursal</p>
        </div>

        {/* KPI 4: Recurrencia Anual Estimada */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Valor Anual Contratado</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-xs font-bold text-slate-600">USD/Año</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{activeLicenses} licencias vigentes</p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* NAVEGACIÓN SECUNDARIA (SUB-PESTAÑAS SAAS)                       */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {!isDistributorMode && (
          <button
            onClick={() => setSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              subTab === 'overview'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Métricas & Resumen</span>
          </button>
        )}

        <button
          onClick={() => setSubTab('clients')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            subTab === 'clients'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Clientes Finales ({clients.length})</span>
        </button>

        <button
          onClick={() => setSubTab('licenses')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            subTab === 'licenses'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Licencias & Series ({licenses.length})</span>
        </button>

        {!isDistributorMode && (
          <button
            onClick={() => setSubTab('distributors')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              subTab === 'distributors'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Distribuidores ({distributors.length})</span>
          </button>
        )}

        <button
          onClick={() => setSubTab('tester')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            subTab === 'tester'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Validador Online API</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* VISTA 1: CLIENTES FINALES (TENANTS CON AISLAMIENTO ESTRICTO)    */}
      {/* ============================================================== */}
      {subTab === 'clients' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Directorio de Clientes Finales (Empresas)
              </h3>
              <p className="text-xs text-slate-500">
                Cada cliente tiene su propio espacio aislado sin cruce de ventas ni datos
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, RUC..."
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl pl-9 pr-3 py-2 focus:bg-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="py-3 px-3">Cliente / Razón Social</th>
                  <th className="py-3 px-3">RUC</th>
                  <th className="py-3 px-3">Distribuidor</th>
                  <th className="py-3 px-3">Suscripción & Tipo</th>
                  <th className="py-3 px-3">Cajas / Sucursales</th>
                  <th className="py-3 px-3">Vencimiento Anual</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {clients
                  .filter(c => !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || (c.ruc && c.ruc.includes(search)))
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center font-black text-teal-700 shrink-0">
                            {c.nombre.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{c.nombre}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px]">
                        {c.ruc || 'N/D'}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold">
                          {c.distribuidor_nombre || c.distribuidor_id || 'Directo'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {c.tipo_producto === 'ON_PREMISE_POS' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                              <Laptop className="w-3 h-3 text-emerald-600" />
                              On-Premise (Local)
                            </span>
                          ) : c.tipo_producto === 'COMBO' ? (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold flex items-center gap-1">
                              <Layers className="w-3 h-3 text-indigo-600" />
                              Combo (Cloud + POS)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-extrabold flex items-center gap-1">
                              <Cloud className="w-3 h-3 text-sky-600" />
                              Central Cloud
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-bold uppercase">({c.tipo_suscripcion || 'ANUAL'})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        {c.cajas_contratadas || 2} Cajas · {c.sucursales_count || 1} Suc.
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                          <Calendar className="w-3 h-3 text-teal-600" />
                          <span>{c.fecha_vencimiento || '2027-01-01'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          c.estado === 'activo'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {c.estado}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Conmutar / Ver Como Cliente */}
                          <button
                            onClick={() => onSwitchTenant && onSwitchTenant(c.id, c.nombre)}
                            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                            title="Ver portal operativo de este cliente"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Ver Portal</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: GESTOR DE LICENCIAS Y SERIES                           */}
      {/* ============================================================== */}
      {subTab === 'licenses' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Licencias y Series Anuales Emitidas
              </h3>
              <p className="text-xs text-slate-500">
                Validación automática online contra servidor central para FrontRest On-Premise y Central Cloud
              </p>
            </div>

            <button
              onClick={() => { setClientForm(prev => ({ ...prev, id: '' })); setShowClientModal(true); }}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:from-teal-700 hover:to-emerald-700 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Nueva Licencia Anual</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {licenses.map((lic) => {
              const venc = new Date(lic.fecha_vencimiento);
              const now = new Date();
              const diffDays = Math.ceil((venc - now) / (1000 * 60 * 60 * 24));
              const isExpired = diffDays < 0;

              return (
                <div 
                  key={lic.id} 
                  className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all bg-slate-50/50 hover:bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        {lic.empresa_nombre || lic.empresa_id}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        lic.tipo_producto === 'ON_PREMISE_POS'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}>
                        {lic.tipo_producto === 'ON_PREMISE_POS' ? <Laptop className="w-3 h-3 text-emerald-600" /> : <Cloud className="w-3 h-3 text-sky-600" />}
                        {lic.tipo_producto === 'ON_PREMISE_POS' ? 'ON-PREMISE POS' : 'CENTRAL CLOUD'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lic.estado === 'ACTIVA' && !isExpired
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        {lic.estado === 'ACTIVA' && !isExpired ? '● ACTIVA' : isExpired ? 'VENCIDA' : lic.estado}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Distribuidor: {lic.distribuidor_nombre || lic.distribuidor_id || 'ABBA INNOVATION'}
                      </span>
                    </div>

                    {/* Número de Serie Principal */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Serie / Key:</span>
                      <code className="text-xs font-mono font-black text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 select-all">
                        {lic.licencia_key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(lic.licencia_key, 'Número de Serie')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                        title="Copiar Serie"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span>Cajas autorizadas: <strong className="text-slate-800">{lic.cajas_autorizadas}</strong></span>
                      <span>•</span>
                      <span>Vencimiento: <strong className="text-slate-800">{lic.fecha_vencimiento}</strong> ({diffDays > 0 ? `${diffDays} días restantes` : 'Expirada'})</span>
                      <span>•</span>
                      <span>Último Check-in Online: <strong className="text-slate-800">{lic.ultimo_check_in ? new Date(lic.ultimo_check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Nunca'}</strong></span>
                    </div>
                  </div>

                  {/* Acciones de Licencia */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    <button
                      onClick={() => handleRenew(lic.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5"
                      title="Renovar suscripción anual por 1 año adicional"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+ Renovar 1 Año</span>
                    </button>

                    <button
                      onClick={() => handleToggleLic(lic.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        lic.estado === 'ACTIVA'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
                      }`}
                    >
                      {lic.estado === 'ACTIVA' ? 'Suspender' : 'Reactivar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 3: DISTRIBUIDORES (SOLO SUPERADMIN)                       */}
      {/* ============================================================== */}
      {subTab === 'distributors' && !isDistributorMode && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Red de Distribuidores Autorizados (Partners)
              </h3>
              <p className="text-xs text-slate-500">
                Socios comerciales autorizados para crear y renovar licencias de sus clientes
              </p>
            </div>

            <button
              onClick={() => { setDistForm({ id: '', nombre: '', ruc: '', email: '', telefono: '', contacto_principal: '', comision_pct: 25, estado: 'activo' }); setShowDistModal(true); }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Distribuidor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {distributors.map((d) => (
              <div key={d.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-100/70 border border-teal-200 flex items-center justify-center font-black text-teal-800">
                      {d.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{d.nombre}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{d.ruc}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {d.estado}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block font-medium">Contacto:</span>
                    <strong className="text-slate-800">{d.contacto_principal || 'N/D'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Comisión:</span>
                    <strong className="text-teal-700">{d.comision_pct || 25}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Teléfono:</span>
                    <strong className="text-slate-800">{d.telefono || 'N/D'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Email:</span>
                    <strong className="text-slate-800">{d.email || 'N/D'}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 4: VALIDADOR ONLINE API (SIMULADOR DE TERMINAL POS)      */}
      {/* ============================================================== */}
      {subTab === 'tester' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-teal-600" />
              <span>Simulador del Servidor de Licencias Online</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pruebe cómo el TPV local FrontRest valida automáticamente la serie y fecha de vencimiento contra el endpoint <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-teal-800 font-bold">/api/validate-license</code>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Número de Serie o Token de Licencia a Verificar:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="Ej: ICON-OP-2026-8F42-99B1-7C4E"
                className="flex-1 bg-white border border-slate-200 text-xs font-mono font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={handleTestValidation}
                disabled={testing || !testKey}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{testing ? 'Verificando...' : 'Comprobar Licencia en Línea'}</span>
              </button>
            </div>
          </div>

          {/* Resultado de la simulación */}
          {testResult && (
            <div className={`p-4 rounded-2xl border transition-all ${
              testResult.valid
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 mb-2 font-black text-sm">
                {testResult.valid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>LICENCIA VÁLIDA Y ACTIVA EN LÍNEA ✅</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>LICENCIA DENEGADA O INVÁLIDA ❌</span>
                  </>
                )}
              </div>

              {testResult.valid ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-emerald-200 font-medium">
                  <div>
                    <span className="text-emerald-700 font-bold block">Empresa Autorizada:</span>
                    <strong>{testResult.empresa}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-bold block">Vencimiento Anual:</span>
                    <strong>{testResult.fecha_vencimiento} ({testResult.dias_restantes} días)</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-bold block">Cajas Habilitadas:</span>
                    <strong>{testResult.cajas_autorizadas} Terminales ICG</strong>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-bold text-rose-700 pt-1">
                  {testResult.error || 'La serie especificada no existe o no tiene pagos registrados.'}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 5: MÉTRICAS Y RESUMEN                                    */}
      {/* ============================================================== */}
      {subTab === 'overview' && !isDistributorMode && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">
            Resumen de Suscripciones por Distribuidor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {distributors.map(d => {
              const distClients = clients.filter(c => c.distribuidor_id === d.id);
              const distLicenses = licenses.filter(l => l.distribuidor_id === d.id);
              const distRevenue = distLicenses.reduce((acc, curr) => acc + (Number(curr.monto_anual) || 0), 0);

              return (
                <div key={d.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">{d.nombre}</span>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {d.comision_pct}% Com.
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span>Clientes Asignados: <strong className="text-slate-900">{distClients.length}</strong></span>
                    <span>Licencias Emitidas: <strong className="text-slate-900">{distLicenses.length}</strong></span>
                    <span>Volumen Anual: <strong className="text-teal-700">${distRevenue.toFixed(2)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREAR CLIENTE FINAL & EMITIR LICENCIA                   */}
      {/* ============================================================== */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Registrar Cliente Final & Licencia</h3>
              </div>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Nombre o Razón Social:</label>
                <input
                  type="text"
                  required
                  value={clientForm.nombre}
                  onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
                  placeholder="Ej: PIZZERÍA ROMA S.A."
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">RUC / Cédula:</label>
                  <input
                    type="text"
                    value={clientForm.ruc}
                    onChange={(e) => setClientForm({ ...clientForm, ruc: e.target.value })}
                    placeholder="1557000-1-2024"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Distribuidor Asignado:</label>
                  <select
                    disabled={isDistributorMode}
                    value={clientForm.distribuidor_id}
                    onChange={(e) => setClientForm({ ...clientForm, distribuidor_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    {distributors.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Tipo de Suscripción:</label>
                  <select
                    value={clientForm.tipo_producto}
                    onChange={(e) => setClientForm({ ...clientForm, tipo_producto: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="ON_PREMISE_POS">💻 ICONWEBCONECT On-Premise (Local)</option>
                    <option value="CENTRAL_CLOUD">🌐 ICONWEBCONECT Central (Web Cloud)</option>
                    <option value="COMBO">🚀 COMBO (Cloud + On-Premise)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Cajas Contratadas:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={clientForm.cajas_contratadas}
                    onChange={(e) => setClientForm({ ...clientForm, cajas_contratadas: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-800">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Emisión Automática de Licencia Anual</span>
                </div>
                <p className="text-[11px] text-teal-700">
                  Al crear este cliente se generará automáticamente su número de serie anual (validez 365 días) listo para registrar en ICG FrontRest.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-black rounded-xl shadow-sm transition-all"
                >
                  Crear Cliente y Generar Serie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NUEVO DISTRIBUIDOR                                      */}
      {/* ============================================================== */}
      {showDistModal && !isDistributorMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Nuevo Distribuidor Autorizado</h3>
              </div>
              <button onClick={() => setShowDistModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveDistributor} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Nombre Comercial o Empresa:</label>
                <input
                  type="text"
                  required
                  value={distForm.nombre}
                  onChange={(e) => setDistForm({ ...distForm, nombre: e.target.value })}
                  placeholder="Ej: SMART POS SOLUTIONS S.A."
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">RUC:</label>
                  <input
                    type="text"
                    value={distForm.ruc}
                    onChange={(e) => setDistForm({ ...distForm, ruc: e.target.value })}
                    placeholder="155...-2-2025"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">% Comisión:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={distForm.comision_pct}
                    onChange={(e) => setDistForm({ ...distForm, comision_pct: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Contacto Principal:</label>
                <input
                  type="text"
                  value={distForm.contacto_principal}
                  onChange={(e) => setDistForm({ ...distForm, contacto_principal: e.target.value })}
                  placeholder="Nombre y Apellido del Encargado"
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Email:</label>
                  <input
                    type="email"
                    value={distForm.email}
                    onChange={(e) => setDistForm({ ...distForm, email: e.target.value })}
                    placeholder="contacto@distribuidor.com"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Teléfono:</label>
                  <input
                    type="text"
                    value={distForm.telefono}
                    onChange={(e) => setDistForm({ ...distForm, telefono: e.target.value })}
                    placeholder="+507 6000-0000"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDistModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all"
                >
                  Guardar Distribuidor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
