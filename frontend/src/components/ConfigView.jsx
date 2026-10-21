import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Copy, 
  Download, 
  Server, 
  Database, 
  Terminal, 
  ShieldCheck, 
  Store, 
  Cpu, 
  Save, 
  X,
  ExternalLink
} from 'lucide-react';

export default function ConfigView({ branches = [], heartbeats = {}, onBranchesUpdated }) {
  const [sucursalesList, setSucursalesList] = useState(branches);
  const [cajasList, setCajasList] = useState(() => {
    try {
      const saved = localStorage.getItem('goyurt_cajas_config');
      return saved ? JSON.parse(saved) : [
        { id: 'caja-goyurt-01-01', sucursal_id: 'goyurt-suc-01', codigo: 'CAJA1', descripcion: 'Caja Principal - Sucursal 1', serie: 'T1' },
        { id: 'caja-goyurt-02-01', sucursal_id: 'goyurt-suc-02', codigo: 'CAJA1', descripcion: 'Caja Principal - Sucursal 2', serie: 'T1' }
      ];
    } catch (_) {
      return [];
    }
  });

  // Parámetros de SQL Server de cada local
  const [sqlConfigs, setSqlConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('goyurt_sql_configs');
      return saved ? JSON.parse(saved) : {
        'goyurt-suc-01': {
          server: 'localhost\\SQLEXPRESS',
          database: 'FRONTREST',
          user: 'sa',
          password: 'masterkey',
          port: '1433'
        },
        'goyurt-suc-02': {
          server: 'localhost\\SQLEXPRESS',
          database: 'FRONTREST',
          user: 'sa',
          password: 'masterkey',
          port: '1433'
        }
      };
    } catch (_) {
      return {};
    }
  });

  // Estados de Modales
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    id: '',
    codigo: '',
    nombre: '',
    direccion: '',
    telefono: '',
    server: 'localhost\\SQLEXPRESS',
    database: 'FRONTREST',
    user: 'sa',
    password: 'masterkey',
    port: '1433'
  });

  const [showCajaModal, setShowCajaModal] = useState(false);
  const [cajaForm, setCajaForm] = useState({
    sucursal_id: 'goyurt-suc-01',
    codigo: 'CAJA1',
    descripcion: 'Punto de Venta ICG FrontRest',
    serie: 'T1'
  });

  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setSucursalesList(branches);
  }, [branches]);

  // Generador de Contenido .env Dinámico para cada Sucursal
  const generateEnvConfig = (branchId) => {
    const branch = sucursalesList.find(b => b.id === branchId) || { nombre: 'Sucursal', codigo: '01' };
    const sqlCfg = sqlConfigs[branchId] || {
      server: 'localhost\\SQLEXPRESS',
      database: 'FRONTREST',
      user: 'sa',
      password: 'masterkey',
      port: '1433'
    };

    return `# ==============================================================================
# CONFIGURACIÓN DEL CONECTOR LOCAL: ICON-SYNC-AGENT
# EMPRESA: GOYURT PANAMÁ
# SUCURSAL: ${branch.nombre} (${branchId})
# ==============================================================================

# 1. IDENTIFICADORES EN LA NUBE
EMPRESA_ID=goyurt
SUCURSAL_ID=${branchId}
CAJA_ID=caja-${branchId}-01

# 2. CONEXIÓN A SUPABASE CENTRAL
SUPABASE_URL=https://edsdmewyiahhrkyngunp.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc2RtZXd5aWFoaHJreW5ndW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDUzNTgsImV4cCI6MjEwODE4MTM1OH0.maSB2H-VvOffzevas6DsdRQyTsWakUJkQ5tj2-8Q3LM

# 3. BASE DE DATOS LOCAL ICG FRONTREST (SQL SERVER)
ICG_SERVER=${sqlCfg.server}
ICG_DATABASE=${sqlCfg.database}
ICG_USER=${sqlCfg.user}
ICG_PASSWORD=${sqlCfg.password}
ICG_PORT=${sqlCfg.port}

# 4. FRECUENCIA DE SINCRONIZACIÓN (Milisegundos)
SYNC_INTERVAL_MS=15000
HEARTBEAT_INTERVAL_MS=30000
`;
  };

  // Copiar .env
  const handleCopyEnv = (text, branchId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(branchId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Descargar .env
  const handleDownloadEnv = (branchId, branchName) => {
    const content = generateEnvConfig(branchId);
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `.env.${branchId}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Abrir Modal de Edición o Creación
  const openEditBranch = (branch) => {
    setEditingBranch(branch);
    const sqlCfg = sqlConfigs[branch.id] || {
      server: 'localhost\\SQLEXPRESS',
      database: 'FRONTREST',
      user: 'sa',
      password: 'masterkey',
      port: '1433'
    };

    setBranchForm({
      id: branch.id,
      codigo: branch.codigo || '',
      nombre: branch.nombre || '',
      direccion: branch.direccion || '',
      telefono: branch.telefono || '',
      server: sqlCfg.server,
      database: sqlCfg.database,
      user: sqlCfg.user,
      password: sqlCfg.password,
      port: sqlCfg.port
    });
    setShowBranchModal(true);
  };

  const openNewBranch = () => {
    setEditingBranch(null);
    const nextNum = sucursalesList.length + 1;
    const nextId = `goyurt-suc-0${nextNum}`;
    setBranchForm({
      id: nextId,
      codigo: `0${nextNum}`,
      nombre: `GOYURT - Sucursal ${nextNum}`,
      direccion: `Ciudad de Panamá, Local ${nextNum}`,
      telefono: '+507 200-0000',
      server: 'localhost\\SQLEXPRESS',
      database: 'FRONTREST',
      user: 'sa',
      password: 'masterkey',
      port: '1433'
    });
    setShowBranchModal(true);
  };

  // Guardar Sucursal en Supabase y Local
  const handleSaveBranch = async (e) => {
    e.preventDefault();
    try {
      const branchData = {
        id: branchForm.id.trim(),
        empresa_id: 'goyurt',
        codigo: branchForm.codigo.trim(),
        nombre: branchForm.nombre.trim(),
        direccion: branchForm.direccion.trim(),
        telefono: branchForm.telefono.trim(),
        activo: true
      };

      await supabase.from('sucursales').upsert(branchData);

      // Guardar Configuración SQL Server
      const updatedSql = {
        ...sqlConfigs,
        [branchForm.id]: {
          server: branchForm.server.trim(),
          database: branchForm.database.trim(),
          user: branchForm.user.trim(),
          password: branchForm.password.trim(),
          port: branchForm.port.trim()
        }
      };
      setSqlConfigs(updatedSql);
      localStorage.setItem('goyurt_sql_configs', JSON.stringify(updatedSql));

      // Actualizar lista local
      let updatedBranches;
      if (editingBranch) {
        updatedBranches = sucursalesList.map(b => b.id === branchForm.id ? { ...b, ...branchData } : b);
      } else {
        updatedBranches = [...sucursalesList, branchData];
      }
      setSucursalesList(updatedBranches);
      if (onBranchesUpdated) onBranchesUpdated(updatedBranches);

      setShowBranchModal(false);
    } catch (err) {
      alert('Error guardando sucursal: ' + err.message);
    }
  };

  // Guardar Nueva Caja
  const handleSaveCaja = async (e) => {
    e.preventDefault();
    try {
      const newCaja = {
        id: `caja-${cajaForm.sucursal_id}-${Date.now().toString().slice(-4)}`,
        sucursal_id: cajaForm.sucursal_id,
        codigo: cajaForm.codigo.trim().toUpperCase(),
        descripcion: cajaForm.descripcion.trim(),
        serie: cajaForm.serie.trim().toUpperCase()
      };

      const updated = [...cajasList, newCaja];
      setCajasList(updated);
      localStorage.setItem('goyurt_cajas_config', JSON.stringify(updated));

      // Guardar en Supabase opcionalmente
      try {
        await supabase.from('cajas').upsert({
          id: newCaja.id,
          sucursal_id: newCaja.sucursal_id,
          codigo_caja: newCaja.codigo,
          serie_asignada: newCaja.serie,
          activo: true
        });
      } catch (_) {}

      setShowCajaModal(false);
    } catch (err) {
      alert('Error guardando caja: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Encabezado */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Configuración de Sucursales, Cajas y Rutas SQL</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-widest">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Administra los locales de <strong>GOYURT PANAMÁ</strong>, puertos SQL Server de cada terminal y descarga los conectores locales.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCajaModal(true)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Añadir Caja</span>
          </button>

          <button
            onClick={openNewBranch}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Sucursal</span>
          </button>
        </div>
      </div>

      {/* 2. Grid de Sucursales y Enlaces a SQL Express */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sucursalesList.map((branch) => {
          const sqlCfg = sqlConfigs[branch.id] || {
            server: 'localhost\\SQLEXPRESS',
            database: 'FRONTREST',
            user: 'sa',
            password: 'masterkey',
            port: '1433'
          };
          const branchCajas = cajasList.filter(c => c.sucursal_id === branch.id);
          const hb = heartbeats[branch.id];
          const isOnline = hb && (new Date() - new Date(hb.ultimo_ping)) < 3 * 60 * 1000;
          const envString = generateEnvConfig(branch.id);

          return (
            <div
              key={branch.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header de la Tarjeta */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono">
                      CÓDIGO: {branch.codigo || '01'}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      isOnline
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {isOnline ? '🟢 CONECTADA' : '⚪ DESCONECTADA'}
                    </span>
                  </div>

                  <button
                    onClick={() => openEditBranch(branch)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Editar Sucursal y Parámetros SQL"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-lg font-black text-slate-900">{branch.nombre}</h4>
                <p className="text-xs text-slate-500 mb-4 font-medium">{branch.direccion || 'Ubicación registrada'}</p>

                {/* Parámetros de SQL Server Local */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 mb-4">
                  <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Conexión SQL Server ICG en este Local:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">INSTANCIA SQL:</span>
                      <span className="font-mono text-slate-800 font-bold">{sqlCfg.server}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">BASE DE DATOS:</span>
                      <span className="font-mono text-slate-800 font-bold">{sqlCfg.database}</span>
                    </div>
                  </div>
                </div>

                {/* Cajas Asociadas a esta Sucursal */}
                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    Cajas y Puntos de Venta Registrados ({branchCajas.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {branchCajas.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Caja 1 (Por defecto)</span>
                    ) : (
                      branchCajas.map((cj) => (
                        <div key={cj.id} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold text-slate-800">{cj.codigo || cj.codigo_caja}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({cj.serie || cj.serie_asignada || 'T1'})</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Vista previa de archivo .env generado */}
                <div className="relative">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[10px] text-slate-700 max-h-32 overflow-y-auto">
                    <pre>{envString}</pre>
                  </div>
                </div>
              </div>

              {/* Botones de Acción VERDES */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleCopyEnv(envString, branch.id)}
                  className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded-xl border border-slate-200 transition-all"
                >
                  {copiedId === branch.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{copiedId === branch.id ? '¡Copiado!' : 'Copiar .env'}</span>
                </button>

                <button
                  onClick={() => handleDownloadEnv(branch.id, branch.nombre)}
                  className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .env</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Modal Crear / Editar Sucursal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <span>{editingBranch ? 'Editar Sucursal' : 'Crear Nueva Sucursal'}</span>
              </h4>
              <button onClick={() => setShowBranchModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={branchForm.codigo}
                    onChange={(e) => setBranchForm({ ...branchForm, codigo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    required
                    value={branchForm.nombre}
                    onChange={(e) => setBranchForm({ ...branchForm, nombre: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Dirección / Centro Comercial</label>
                <input
                  type="text"
                  value={branchForm.direccion}
                  onChange={(e) => setBranchForm({ ...branchForm, direccion: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              {/* Conexión SQL Server Local */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[11px] font-black uppercase text-emerald-700 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Configuración SQL Server ICG (Local):</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Servidor / Instancia:</label>
                    <input
                      type="text"
                      required
                      value={branchForm.server}
                      onChange={(e) => setBranchForm({ ...branchForm, server: e.target.value })}
                      placeholder="localhost\SQLEXPRESS"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Base de Datos:</label>
                    <input
                      type="text"
                      required
                      value={branchForm.database}
                      onChange={(e) => setBranchForm({ ...branchForm, database: e.target.value })}
                      placeholder="FRONTREST"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Usuario SQL:</label>
                    <input
                      type="text"
                      value={branchForm.user}
                      onChange={(e) => setBranchForm({ ...branchForm, user: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Password:</label>
                    <input
                      type="text"
                      value={branchForm.password}
                      onChange={(e) => setBranchForm({ ...branchForm, password: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">Puerto:</label>
                    <input
                      type="text"
                      value={branchForm.port}
                      onChange={(e) => setBranchForm({ ...branchForm, port: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Guardar Sucursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Crear Nueva Caja */}
      {showCajaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>Registrar Nueva Caja / TPV</span>
              </h4>
              <button onClick={() => setShowCajaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCaja} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Sucursal</label>
                <select
                  value={cajaForm.sucursal_id}
                  onChange={(e) => setCajaForm({ ...cajaForm, sucursal_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  {sucursalesList.map((b) => (
                    <option key={b.id} value={b.id}>{b.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Código Caja</label>
                  <input
                    type="text"
                    required
                    value={cajaForm.codigo}
                    onChange={(e) => setCajaForm({ ...cajaForm, codigo: e.target.value })}
                    placeholder="CAJA2"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Serie Ticket</label>
                  <input
                    type="text"
                    required
                    value={cajaForm.serie}
                    onChange={(e) => setCajaForm({ ...cajaForm, serie: e.target.value })}
                    placeholder="T2"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">Descripción</label>
                <input
                  type="text"
                  value={cajaForm.descripcion}
                  onChange={(e) => setCajaForm({ ...cajaForm, descripcion: e.target.value })}
                  placeholder="TPV Mostrador 2"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCajaModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Guardar Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
