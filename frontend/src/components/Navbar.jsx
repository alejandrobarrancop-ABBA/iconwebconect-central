import React from 'react';
import { Store, RefreshCw, Calendar, Building2, BarChart3 } from 'lucide-react';

export default function Navbar({
  selectedBranch,
  setSelectedBranch,
  branches = [],
  dateRange,
  setDateRange,
  onRefresh,
  loading
}) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Marca & Título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-tight">ICONWEBCONECT</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                CENTRAL
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Cliente: <strong className="text-slate-200">GOYURT PANAMÁ</strong></span>
            </div>
          </div>
        </div>

        {/* Filtros Ejecutivos (Estilo Power BI) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Sucursal */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm hover:border-slate-600 transition-colors"
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
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm hover:border-slate-600 transition-colors"
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

          {/* Botón de Refrescar en Tiempo Real */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
            title="Actualizar datos desde la nube"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
