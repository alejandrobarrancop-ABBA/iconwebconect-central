import React from 'react';
import { RefreshCw, Building2, BarChart3, LogOut, Shield } from 'lucide-react';

export default function Navbar({
  selectedBranch,
  setSelectedBranch,
  branches = [],
  dateRange,
  setDateRange,
  onRefresh,
  loading,
  currentUser,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#060d1f]/95 backdrop-blur border-b border-[#1a2d6b] px-4 sm:px-8 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Marca & Logo ICONWEBCONECT */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white tracking-tight">ICONWEBCONECT</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                CENTRAL
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Cliente: <strong className="text-slate-200">GOYURT PANAMÁ</strong></span>
            </div>
          </div>
        </div>

        {/* Filtros Ejecutivos & Perfil de Usuario */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Sucursal */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-[#0b1530] border border-[#1a2d6b] text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm hover:border-slate-500 transition-colors"
            >
              <option value="ALL">🏢 Todas las Sucursales (Consolidado)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  📍 {b.nombre}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Selector de Rango de Fechas */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-[#0b1530] border border-[#1a2d6b] text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm hover:border-slate-500 transition-colors"
            >
              <option value="TODAY">📅 Ventas de Hoy</option>
              <option value="YESTERDAY">📅 Ventas de Ayer</option>
              <option value="LAST_7_DAYS">📅 Últimos 7 Días</option>
              <option value="THIS_MONTH">📅 Mes en Curso</option>
              <option value="THIS_YEAR">📅 Año Completo (2026)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Botón Refrescar en Vivo */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#0b1530] hover:bg-[#111f4a] active:bg-[#060d1f] border border-[#1a2d6b] text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
            title="Refrescar datos en vivo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* Usuario & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#1a2d6b]">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">{currentUser.username}</span>
                <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                  {currentUser.rol}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
