import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Building2, 
  BarChart3, 
  LogOut, 
  Shield, 
  Lock, 
  Star, 
  Clock, 
  Calendar,
  Radio,
  ChevronDown
} from 'lucide-react';

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
  // Reloj y Fecha del Sistema en Tiempo Real
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateFormatted = now.toLocaleDateString('es-PA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // ADMINISTRADOR y GERENTE EJECUTIVO tienen acceso a todas las sucursales (Consolidado)
  const canViewAllBranches = currentUser?.rol === 'ADMINISTRADOR' || currentUser?.rol === 'GERENTE EJECUTIVO';
  const assignedBranch = currentUser?.sucursal;
  const assignedBranchObj = branches.find(b => b.id === assignedBranch);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* ============================================================== */}
        {/* FILA 1: MARCA OFICIAL, RELOJ EN VIVO Y CUENTA DE USUARIO      */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between gap-3">
          {/* A) Marca Principal de la Aplicación: ICONWEBCONECT */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 shadow-md shadow-emerald-600/25 flex items-center justify-center text-white shrink-0 border border-emerald-400">
              <BarChart3 className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  ICONWEBCONECT
                </span>
                <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-widest">
                  CENTRAL
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden xs:block">
                Plataforma Gerencial en la Nube
              </p>
            </div>
          </div>

          {/* B) Reloj y Fecha del Sistema en Vivo (Centrado en Pantallas Medianas y Grandes) */}
          <div className="hidden md:flex items-center gap-2.5 bg-gradient-to-r from-teal-50/90 via-emerald-50/90 to-teal-50/90 border border-teal-200/90 px-3.5 py-1.5 rounded-2xl shadow-sm">
            <div className="relative flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 relative" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold capitalize">
                <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{dateFormatted}</span>
              </div>

              <span className="text-teal-300 font-bold">•</span>

              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-teal-200 shadow-sm font-mono font-black text-teal-900 text-xs">
                <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{timeFormatted}</span>
              </div>
            </div>
          </div>

          {/* C) Área del Cliente & Usuario: LOGO DEL CLIENTE (GOYURT) + CUENTA + LOGOUT */}
          {currentUser && (
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              {/* Logo del Cliente (GOYURT) Ampliado y Visible */}
              <div className="bg-white px-3 sm:px-4 py-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0" title="Cliente: GOYURT PANAMÁ">
                <img
                  src="/goyurt-logo.png"
                  alt="Goyurt Panamá"
                  className="h-8 sm:h-9 w-auto object-contain max-w-[90px] sm:max-w-[120px]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Datos del Usuario y Rol */}
              <div className="flex flex-col text-right">
                <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                  {currentUser.username}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-end gap-1 ${
                  currentUser.rol === 'ADMINISTRADOR'
                    ? 'text-teal-700'
                    : (currentUser.rol === 'GERENTE EJECUTIVO' ? 'text-indigo-700' : 'text-slate-600')
                }`}>
                  {currentUser.rol === 'GERENTE EJECUTIVO' && <Star className="w-2.5 h-2.5 text-indigo-500 shrink-0" />}
                  <span>{currentUser.rol}</span>
                  {!canViewAllBranches && <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                </span>
              </div>

              {/* Botón Cerrar Sesión en Rojo */}
              <button
                onClick={onLogout}
                className="p-2 sm:p-2.5 text-rose-500 hover:text-white hover:bg-rose-600 bg-rose-50 rounded-xl transition-all border border-rose-200 shadow-sm shrink-0"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* FILA 2: BARRA DE FILTROS Y CONTROLES (RESPONSIVA & CÓMODA)    */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          {/* Reloj en Móviles (< 768px) */}
          <div className="flex md:hidden items-center justify-center gap-2 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200 px-3 py-1 rounded-xl text-xs w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span className="text-slate-700 font-bold capitalize text-[11px]">{dateFormatted}</span>
            <span className="text-teal-300 font-bold">•</span>
            <span className="font-mono font-black text-teal-900 text-[11px] bg-white px-1.5 py-0.5 rounded border border-teal-200">{timeFormatted}</span>
          </div>

          {/* Filtros: Sucursal, Fecha y Botón Actualizar */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full">
            {/* Selector de Sucursal */}
            <div className="relative flex-1 min-w-[200px]">
              {canViewAllBranches ? (
                <>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3.5 pr-8 py-2.5 appearance-none focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-sm transition-colors"
                  >
                    <option value="ALL">🌐 Todas las Sucursales (Consolidado)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        📍 {b.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </>
              ) : (
                <div 
                  className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2.5 shadow-sm"
                  title={`Acceso restringido por rol ${currentUser?.rol} a su sucursal asignada`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">📍 {assignedBranchObj ? assignedBranchObj.nombre : (assignedBranch || 'Sucursal Asignada')}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase ml-auto shrink-0">
                    Exclusivo
                  </span>
                </div>
              )}
            </div>

            {/* Selector de Rango de Fechas */}
            <div className="relative flex-1 min-w-[170px]">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3.5 pr-8 py-2.5 appearance-none focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer shadow-sm transition-colors"
              >
                <option value="TODAY">📅 Ventas de Hoy</option>
                <option value="YESTERDAY">📅 Ventas de Ayer</option>
                <option value="LAST_7_DAYS">📅 Últimos 7 Días</option>
                <option value="THIS_MONTH">📅 Mes en Curso</option>
                <option value="THIS_YEAR">📅 Año Completo (2026)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Botón Refrescar TURQUESA (Con buen tamaño táctil) */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#22c1b4] hover:bg-teal-600 active:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-teal-500/25 disabled:opacity-50 shrink-0"
              title="Refrescar datos en vivo"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-white' : 'text-teal-100'}`} />
              <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
