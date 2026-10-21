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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* 1. Marca Principal de la Aplicación: LOGO VERDE GRÁFICO ICONWEBCONECT */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 shadow-md shadow-emerald-600/25 flex items-center justify-center text-white shrink-0 border border-emerald-400">
            <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900 tracking-tight">ICONWEBCONECT</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-widest">
                CENTRAL NUBE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Plataforma de Analítica & Dashboard Gerencial
            </p>
          </div>
        </div>

        {/* 2. Filtros Ejecutivos & Perfil con Logo del Cliente */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Sucursal */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
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
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
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

          {/* Botón Refrescar en Vivo TURQUESA */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-teal-600/20 disabled:opacity-50"
            title="Refrescar datos en vivo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-white' : 'text-teal-100'}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* 3. Área del Cliente & Usuario: LOGO DEL CLIENTE (GOYURT) + CUENTA + CERRAR SESIÓN */}
          {currentUser && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              {/* Logo del Cliente (GOYURT) colocado en la sección de usuario */}
              <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center" title="Empresa: GOYURT PANAMÁ">
                <img
                  src="/goyurt-logo.png"
                  alt="Goyurt Panamá"
                  className="h-6 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Datos del Usuario y Rol */}
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-slate-900 leading-tight">{currentUser.username}</span>
                <span className="text-[10px] text-teal-700 font-extrabold uppercase tracking-wider">{currentUser.rol}</span>
              </div>

              {/* Botón Cerrar Sesión en Rojo */}
              <button
                onClick={onLogout}
                className="p-2 text-rose-500 hover:text-white hover:bg-rose-600 bg-rose-50 rounded-xl transition-all border border-rose-200 shadow-sm"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
