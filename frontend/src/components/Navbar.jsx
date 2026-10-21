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
    <header className="sticky top-0 z-50 bg-[#070f1e]/95 backdrop-blur border-b border-[#172d54] px-4 sm:px-8 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Marca & Logo Oficial de GOYURT */}
        <div className="flex items-center gap-3">
          {/* Contenedor del Logo de Goyurt */}
          <div className="bg-white px-3 py-1.5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
            <img
              src="/goyurt-logo.png"
              alt="Goyurt Logo"
              className="h-7 w-auto object-contain"
              onError={(e) => {
                // Fallback si la imagen tarda en cargar
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white tracking-tight">ICONWEBCONECT</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#22c1b4]/20 text-[#22c1b4] border border-[#22c1b4]/40 uppercase tracking-widest">
                CENTRAL NUBE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5 text-[#22c1b4]" />
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
              className="bg-[#0b172d] border border-[#172d54] text-slate-200 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:border-[#22c1b4] cursor-pointer shadow-sm hover:border-slate-500 transition-colors"
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
              className="bg-[#0b172d] border border-[#172d54] text-slate-200 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:border-[#22c1b4] cursor-pointer shadow-sm hover:border-slate-500 transition-colors"
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
            className="flex items-center gap-1.5 bg-[#0b172d] hover:bg-[#102142] active:bg-[#070f1e] border border-[#172d54] text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
            title="Refrescar datos en vivo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#22c1b4]' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* Usuario & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#172d54]">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">{currentUser.username}</span>
                <span className="text-[10px] text-[#22c1b4] font-black tracking-wider uppercase">
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
