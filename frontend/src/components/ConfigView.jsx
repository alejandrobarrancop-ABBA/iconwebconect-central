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

  // Modales
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    id: '',
    codigo: '',
    nombre: '',
    direccion: '',
    sqlServer: 'localhost\\SQLEXPRESS',
    sqlDatabase: 'FRONTREST'
  });

  const [showCajaModal, setShowCajaModal] = useState(false);
  const [cajaForm, setCajaForm] = useState({
    sucursal_id: 'goyurt-suc-01',
    codigo: 'CAJA2',
    descripcion: 'Segunda Caja / Punto de Venta',
    serie: 'T2'
  });

  const [copiedId, setCopiedId] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    if (branches && branches.length > 0) {
      setSucursalesList(branches);
    }
  }, [branches]);

  const saveAllConfigs = (updatedBranches, updatedCajas, updatedSql) => {
    setSucursalesList(updatedBranches);
    setCajasList(updatedCajas);
    setSqlConfigs(updatedSql);
    localStorage.setItem('goyurt_branches_local', JSON.stringify(updatedBranches));
    localStorage.setItem('goyurt_cajas_config', JSON.stringify(updatedCajas));
    localStorage.setItem('goyurt_sql_configs', JSON.stringify(updatedSql));

    // Si hay callback para refrescar app principal
    if (onBranchesUpdated) {
      onBranchesUpdated(updatedBranches);
    }
  };

  // Abrir Modal Crear Sucursal
  const handleOpenCreateBranch = () => {
    setEditingBranch(null);
    const nextNum = sucursalesList.length + 1;
    const cod = String(nextNum).padStart(2, '0');
    setBranchForm({
      id: `goyurt-suc-${cod}`,
      codigo: cod,
      nombre: `GOYURT - Sucursal ${nextNum}`,
      direccion: 'Ciudad de Panamá',
      sqlServer: 'localhost\\SQLEXPRESS',
      sqlDatabase: 'FRONTREST'
    });
    setShowBranchModal(true);
  };

  // Abrir Modal Editar Sucursal
  const handleOpenEditBranch = (b) => {
    setEditingBranch(b);
    const currentSql = sqlConfigs[b.id] || { server: 'localhost\\SQLEXPRESS', database: 'FRONTREST' };
    setBranchForm({
      id: b.id,
      codigo: b.codigo || '01',
      nombre: b.nombre || '',
      direccion: b.direccion || '',
      sqlServer: currentSql.server || 'localhost\\SQLEXPRESS',
      sqlDatabase: currentSql.database || 'FRONTREST'
    });
    setShowBranchModal(true);
  };

  // Guardar Sucursal (Crear o Editar)
  const handleSaveBranch = async (e) => {
    e.preventDefault();
    const branchId = editingBranch ? editingBranch.id : branchForm.id;
    const newBranchObj = {
      id: branchId,
      empresa_id: 'goyurt',
      codigo: branchForm.codigo,
      nombre: branchForm.nombre,
      direccion: branchForm.direccion,
      activa: true
    };

    // Actualizar en Supabase
    try {
      await supabase.from('sucursales').upsert(newBranchObj);
    } catch (_) {}

    // Actualizar SQL Config
    const updatedSql = {
      ...sqlConfigs,
      [branchId]: {
        server: branchForm.sqlServer || 'localhost\\SQLEXPRESS',
        database: branchForm.sqlDatabase || 'FRONTREST',
        user: 'sa',
        password: 'masterkey',
        port: '1433'
      }
    };

    let updatedBranches;
    if (editingBranch) {
      updatedBranches = sucursalesList.map(b => b.id === branchId ? newBranchObj : b);
    } else {
      updatedBranches = [...sucursalesList, newBranchObj];
      // Crear automáticamente la Caja 1 para la nueva sucursal
      const newCaja = {
        id: `caja-${branchId}-01`,
        sucursal_id: branchId,
        codigo: 'CAJA1',
        descripcion: `Caja Principal - ${branchForm.nombre}`,
        serie: 'T1'
      };
      const updatedCajas = [...cajasList, newCaja];
      saveAllConfigs(updatedBranches, updatedCajas, updatedSql);
      setShowBranchModal(false);
      setSaveSuccessMsg(`¡Sucursal "${branchForm.nombre}" guardada con éxito!`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
      return;
    }

    saveAllConfigs(updatedBranches, cajasList, updatedSql);
    setShowBranchModal(false);
    setSaveSuccessMsg(`¡Sucursal "${branchForm.nombre}" actualizada con éxito!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Guardar Nueva Caja
  const handleSaveCaja = async (e) => {
    e.preventDefault();
    const newCajaId = `caja-${cajaForm.sucursal_id}-${Date.now().toString().slice(-4)}`;
    const newCajaObj = {
      id: newCajaId,
      sucursal_id: cajaForm.sucursal_id,
      codigo_caja: cajaForm.codigo,
      codigo: cajaForm.codigo,
      descripcion: cajaForm.descripcion,
      serie_asignada: cajaForm.serie,
      serie: cajaForm.serie,
      activa: true
    };

    try {
      await supabase.from('cajas').upsert({
        id: newCajaId,
        sucursal_id: cajaForm.sucursal_id,
        codigo_caja: cajaForm.codigo,
        descripcion: cajaForm.descripcion,
        serie_asignada: cajaForm.serie
      });
    } catch (_) {}

    const updatedCajas = [...cajasList, newCajaObj];
    saveAllConfigs(sucursalesList, updatedCajas, sqlConfigs);
    setShowCajaModal(false);
    setSaveSuccessMsg(`¡Caja ${cajaForm.codigo} añadida correctamente!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Generar contenido .env para una sucursal y caja específica
  const generateEnvContent = (sucursalId, cajaCodigo = 'CAJA1', serieDefault = 'T1') => {
    const sqlCfg = sqlConfigs[sucursalId] || { server: 'localhost\\SQLEXPRESS', database: 'FRONTREST', user: 'sa', password: 'masterkey', port: '1433' };
    return `# ==============================================================
# CONFIGURACIÓN ICON-SYNC-AGENT - GOYURT PANAMÁ
# Generado automáticamente desde el Panel de Administración Central
# ==============================================================

# Identificación de la Sucursal y Caja
EMPRESA_ID=goyurt
SUCURSAL_ID=${sucursalId}
CAJA_ID=caja-${sucursalId}-01

# Conexión Local a ICG FrontRest (SQL Server Express de este equipo)
ICG_SERVER=${sqlCfg.server}
ICG_DATABASE=${sqlCfg.database}
ICG_USER=${sqlCfg.user || 'sa'}
ICG_PASSWORD=${sqlCfg.password || 'masterkey'}
ICG_PORT=${sqlCfg.port || '1433'}

# Nube Centralizada (Supabase)
SUPABASE_URL=https://edsdmewyiahhrkyngunp.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc2RtZXd5aWFoaHJreW5ndW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDUzNTgsImV4cCI6MjEwODE4MTM1OH0.maSB2H-VvOffzevas6DsdRQyTsWakUJkQ5tj2-8Q3LM

# Intervalos de Sincronización en Segundos
SYNC_INTERVAL_SECONDS=30
HEARTBEAT_INTERVAL_SECONDS=60`;
  };

  // Descargar archivo .env
  const handleDownloadEnv = (sucursalId, sucursalNombre) => {
    const content = generateEnvContent(sucursalId);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `.env_${sucursalId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copiar al portapapeles
  const handleCopyEnv = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Mensaje de Confirmación */}
      {saveSuccessMsg && (
        <div className="bg-[#22c1b4]/20 border border-[#22c1b4] text-[#22c1b4] px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#22c1b4]/10 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. Encabezado de Sucursales y Botones de Creación */}
      <div className="bg-[#0b172d] border border-[#172d54] rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#22c1b4]/20 border border-[#22c1b4]/40 flex items-center justify-center text-[#22c1b4]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Configuración de Sucursales, Cajas y Rutas SQL</h3>
              <p className="text-xs text-slate-400">
                Gestiona las tiendas de <strong>GOYURT</strong>, rutas de SQL Server Express y nombres de bases de datos de ICG FrontRest
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCajaModal(true)}
            className="flex items-center gap-2 bg-[#070f1e] hover:bg-[#102142] text-slate-200 border border-[#172d54] text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4 text-[#22c1b4]" />
            <span>Añadir Caja POS</span>
          </button>

          <button
            onClick={handleOpenCreateBranch}
            className="flex items-center gap-2 bg-gradient-to-r from-[#22c1b4] to-teal-600 hover:from-teal-400 hover:to-teal-500 text-[#070f1e] text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-[#22c1b4]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nueva Sucursal</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjetas Detalladas por Sucursal Configurada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sucursalesList.map((branch) => {
          const hb = heartbeats[branch.id];
          const isOnline = hb && (new Date() - new Date(hb.ultimo_ping)) < 3 * 60 * 1000;
          const sqlCfg = sqlConfigs[branch.id] || { server: 'localhost\\SQLEXPRESS', database: 'FRONTREST', user: 'sa' };
          const branchCajas = cajasList.filter(c => c.sucursal_id === branch.id);
          const envString = generateEnvContent(branch.id);

          return (
            <div key={branch.id} className="bg-[#0b172d] border border-[#172d54] rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-[#22c1b4]/40 transition-all">
              <div>
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[#22c1b4]/15 border border-[#22c1b4]/40 text-[#22c1b4]">
                      SUCURSAL {branch.codigo || '01'}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                      {isOnline ? 'ONLINE' : 'DESCONECTADA'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEditBranch(branch)}
                    className="p-2 rounded-xl bg-[#070f1e] hover:bg-[#102142] text-slate-300 hover:text-[#22c1b4] border border-[#172d54] transition-all"
                    title="Editar datos de esta sucursal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-lg font-black text-white">{branch.nombre}</h4>
                <p className="text-xs text-slate-400 mb-4">{branch.direccion || 'Ubicación registrada'}</p>

                {/* Parámetros de SQL Server Local */}
                <div className="bg-[#070f1e] border border-[#172d54] rounded-2xl p-4 space-y-2.5 mb-4">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#22c1b4] flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    <span>Conexión SQL Server ICG en este Local:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">INSTANCIA SQL:</span>
                      <span className="font-mono text-slate-200 font-bold">{sqlCfg.server}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">BASE DE DATOS:</span>
                      <span className="font-mono text-slate-200 font-bold">{sqlCfg.database}</span>
                    </div>
                  </div>
                </div>

                {/* Cajas Asociadas a esta Sucursal */}
                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                    Cajas y Puntos de Venta Registrados ({branchCajas.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {branchCajas.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">Caja 1 (Por defecto)</span>
                    ) : (
                      branchCajas.map((cj) => (
                        <div key={cj.id} className="bg-[#070f1e] border border-[#172d54] px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-[#22c1b4]" />
                          <span className="font-bold text-white">{cj.codigo || cj.codigo_caja}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({cj.serie || cj.serie_asignada || 'T1'})</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Vista previa de archivo .env generado */}
                <div className="relative">
                  <div className="bg-[#070f1e] border border-[#172d54] rounded-xl p-3 font-mono text-[10px] text-slate-300 max-h-32 overflow-y-auto">
                    <pre>{envString}</pre>
                  </div>
                </div>
              </div>

              {/* Botones de Acción para el Técnico / Instalador */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#172d54]">
                <button
                  onClick={() => handleCopyEnv(envString, branch.id)}
                  className="flex items-center justify-center gap-1.5 bg-[#070f1e] hover:bg-[#102142] text-slate-200 text-xs font-bold py-2 rounded-xl border border-[#172d54] transition-all"
                >
                  {copiedId === branch.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#22c1b4]" />}
                  <span>{copiedId === branch.id ? '¡Copiado!' : 'Copiar .env'}</span>
                </button>

                <button
                  onClick={() => handleDownloadEnv(branch.id, branch.nombre)}
                  className="flex items-center justify-center gap-1.5 bg-[#22c1b4]/15 hover:bg-[#22c1b4]/25 text-[#22c1b4] text-xs font-bold py-2 rounded-xl border border-[#22c1b4]/40 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b172d] border border-[#172d54] rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-[#22c1b4]" />
                <span>{editingBranch ? 'Editar Sucursal' : 'Crear Nueva Sucursal'}</span>
              </h4>
              <button onClick={() => setShowBranchModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={branchForm.codigo}
                    onChange={(e) => setBranchForm({ ...branchForm, codigo: e.target.value })}
                    className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    placeholder="03"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Nombre de la Tienda</label>
                  <input
                    type="text"
                    required
                    value={branchForm.nombre}
                    onChange={(e) => setBranchForm({ ...branchForm, nombre: e.target.value })}
                    className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="GOYURT - Sucursal 3 (Albrook)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Dirección / Centro Comercial</label>
                <input
                  type="text"
                  value={branchForm.direccion}
                  onChange={(e) => setBranchForm({ ...branchForm, direccion: e.target.value })}
                  className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="Albrook Mall, Pasillo del Koala"
                />
              </div>

              {/* Parámetros de SQL Server */}
              <div className="p-4 bg-[#070f1e] border border-[#172d54] rounded-2xl space-y-3">
                <span className="text-[11px] font-black text-[#22c1b4] uppercase tracking-wider block">
                  ⚙️ Configuración SQL Server Express de este Local:
                </span>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Ruta / Host SQL Server Express</label>
                  <input
                    type="text"
                    required
                    value={branchForm.sqlServer}
                    onChange={(e) => setBranchForm({ ...branchForm, sqlServer: e.target.value })}
                    className="w-full bg-[#0b172d] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    placeholder="localhost\SQLEXPRESS"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Nombre Base de Datos ICG FrontRest</label>
                  <input
                    type="text"
                    required
                    value={branchForm.sqlDatabase}
                    onChange={(e) => setBranchForm({ ...branchForm, sqlDatabase: e.target.value })}
                    className="w-full bg-[#0b172d] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    placeholder="FRONTREST"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#172d54]">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#22c1b4] to-teal-600 hover:from-teal-400 hover:to-teal-500 text-[#070f1e] font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#22c1b4]/20 transition-all"
                >
                  Guardar Sucursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Añadir Caja POS */}
      {showCajaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b172d] border border-[#172d54] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#22c1b4]" />
                <span>Añadir Caja POS a Sucursal</span>
              </h4>
              <button onClick={() => setShowCajaModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCaja} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Asignar a Sucursal</label>
                <select
                  value={cajaForm.sucursal_id}
                  onChange={(e) => setCajaForm({ ...cajaForm, sucursal_id: e.target.value })}
                  className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white"
                >
                  {sucursalesList.map(b => (
                    <option key={b.id} value={b.id}>{b.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Código de Caja</label>
                  <input
                    type="text"
                    required
                    value={cajaForm.codigo}
                    onChange={(e) => setCajaForm({ ...cajaForm, codigo: e.target.value })}
                    className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    placeholder="CAJA2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Serie en ICG</label>
                  <input
                    type="text"
                    required
                    value={cajaForm.serie}
                    onChange={(e) => setCajaForm({ ...cajaForm, serie: e.target.value })}
                    className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    placeholder="T2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Descripción / Función</label>
                <input
                  type="text"
                  value={cajaForm.descripcion}
                  onChange={(e) => setCajaForm({ ...cajaForm, descripcion: e.target.value })}
                  className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="Caja de Atención Rápida o Helados"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#172d54]">
                <button
                  type="button"
                  onClick={() => setShowCajaModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#22c1b4] to-teal-600 hover:from-teal-400 hover:to-teal-500 text-[#070f1e] font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#22c1b4]/20 transition-all"
                >
                  Guardar Caja POS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
