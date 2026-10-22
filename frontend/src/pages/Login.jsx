import React, { useState } from 'react';
import { Lock, User, ArrowRight, AlertCircle, BarChart3, Building2, ShieldCheck, Users, Star } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('ADMIN');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const u = username.trim().toUpperCase();
      const p = password.trim();

      const savedUsersRaw = localStorage.getItem('goyurt_users');
      let registeredUsers = [];
      try {
        if (savedUsersRaw) registeredUsers = JSON.parse(savedUsersRaw);
      } catch (_) {}

      const matchUser = registeredUsers.find(ru => ru.username === u && ru.activo);

      // 1. Acceso SUPERADMIN GLOBAL (Grupo VEV / ABBA)
      if (u === 'SUPERADMIN' || u === 'VEV' || (u === 'SUPER' && p === '1234')) {
        const userObj = {
          username: u,
          nombre: 'SuperAdmin General Global',
          rol: 'SUPERADMIN',
          distribuidor_id: null,
          empresa_id: 'goyurt',
          empresa: 'GRUPO VEV / ABBA INNOVATION S.A.',
          sucursal: 'ALL'
        };
        localStorage.setItem('iconweb_user', JSON.stringify(userObj));
        onLoginSuccess(userObj);
        return;
      }

      // 2. Acceso DISTRIBUIDOR AUTORIZADO (ABBA Innovation / Resellers)
      if (u === 'DISTRIBUIDOR' || u === 'ABBA' || u === 'DIST' || u === 'DIST_ABBA') {
        const userObj = {
          username: u,
          nombre: 'ABBA INNOVATION S.A. (Distribuidor)',
          rol: 'DISTRIBUIDOR',
          distribuidor_id: 'dist-abba',
          distribuidor_nombre: 'ABBA INNOVATION S.A.',
          empresa_id: 'goyurt',
          empresa: 'ABBA INNOVATION S.A.',
          sucursal: 'ALL'
        };
        localStorage.setItem('iconweb_user', JSON.stringify(userObj));
        onLoginSuccess(userObj);
        return;
      }

      // 3. Usuarios de Cliente Final (Goyurt u otros)
      if ((u === 'ADMIN' && p === '1234') || 
          (u === 'EJECUTIVO' && p === '1234') || 
          (u === 'GERENTE' && p === '1234') || 
          (u === 'GERENTE1' && p === '1234') || 
          (u === 'GERENTE2' && p === '1234') || 
          (u === 'USUARIO' && p === '1234') || 
          (u === 'OPERADOR1' && p === '1234') || 
          (u === 'OPERADOR2' && p === '1234') || 
          matchUser) {
        
        // Auto-detección inteligente del rol y sucursal según el usuario
        const detectedRole = matchUser 
          ? matchUser.rol 
          : (u === 'ADMIN' 
              ? 'ADMINISTRADOR' 
              : (u === 'EJECUTIVO' 
                  ? 'GERENTE EJECUTIVO' 
                  : (u.startsWith('GERENTE') ? 'GERENTE' : 'USUARIO')));
        
        let assignedSucursal = 'ALL';
        if (matchUser) {
          assignedSucursal = matchUser.sucursal || (detectedRole === 'ADMINISTRADOR' || detectedRole === 'GERENTE EJECUTIVO' ? 'ALL' : 'goyurt-suc-01');
        } else if (u === 'ADMIN' || u === 'EJECUTIVO') {
          assignedSucursal = 'ALL';
        } else if (u === 'GERENTE' || u === 'GERENTE1' || u === 'OPERADOR1' || u === 'USUARIO') {
          assignedSucursal = 'goyurt-suc-01'; // Sucursal 1
        } else if (u === 'GERENTE2' || u === 'OPERADOR2') {
          assignedSucursal = 'goyurt-suc-02'; // Sucursal 2
        }

        const userObj = {
          username: u,
          nombre: matchUser 
            ? matchUser.nombre 
            : (u === 'ADMIN' 
                ? 'Administrador General' 
                : (u === 'EJECUTIVO' 
                    ? 'Gerencia General Ejecutiva' 
                    : (u === 'GERENTE' ? 'Gerente Sucursal 1' : 'Operador de Sucursal'))),
          rol: detectedRole,
          sucursal: assignedSucursal,
          empresa_id: 'goyurt',
          empresa: 'GOYURT PANAMÁ'
        };

        localStorage.setItem('iconweb_user', JSON.stringify(userObj));
        onLoginSuccess(userObj);
      } else {
        setError('Credenciales incorrectas. Verifique su usuario y contraseña.');
        setLoading(false);
      }
    }, 250);
  };

  const handleQuickFill = (user, pass = '1234') => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
      {/* Resplandores suaves en fondo blanco */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/70 relative z-10">
        {/* Encabezado con Logo Oficial ICONWEBCONECT (Gráfico Verde Analítica) */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 shadow-lg shadow-teal-500/25 mb-3 border-2 border-white">
            <BarChart3 className="w-9 h-9 text-white stroke-[2.5]" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            ICONWEBCONECT
          </h1>

          <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-black uppercase tracking-wider">
            PLATAFORMA SAAS GERENCIAL CENTRAL
          </div>

          {/* Campo Ampliado y Prominente del Logo y Nombre de la Empresa Cliente */}
          <div className="mt-4 flex items-center justify-center gap-4 bg-slate-50 hover:bg-slate-100/80 transition-colors py-3 px-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm mx-auto">
            <img
              src="/goyurt-logo.png"
              alt="Goyurt Panamá"
              className="h-10 w-auto object-contain shrink-0 drop-shadow-sm"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="text-left border-l border-slate-200 pl-3.5">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">
                Empresa Cliente
              </span>
              <span className="text-sm text-slate-900 font-black tracking-tight leading-snug">
                GOYURT PANAMÁ
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2.5 font-medium">
            Multi-Tenant SaaS · Consolidación y Licenciamiento Online
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Usuario
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ADMIN, SUPERADMIN o DISTRIBUIDOR"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Botones de Selección Rápida de Rol */}
          <div className="pt-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
              Acceso Rápido por Rol:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('SUPERADMIN')}
                className={`py-1.5 px-2 rounded-lg border text-left flex items-center gap-1.5 font-bold transition-all ${
                  username === 'SUPERADMIN' 
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">SuperAdmin SaaS</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('DISTRIBUIDOR')}
                className={`py-1.5 px-2 rounded-lg border text-left flex items-center gap-1.5 font-bold transition-all ${
                  username === 'DISTRIBUIDOR' 
                    ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">Distribuidor (ABBA)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN')}
                className={`py-1.5 px-2 rounded-lg border text-left flex items-center gap-1.5 font-bold transition-all ${
                  username === 'ADMIN' 
                    ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">Goyurt Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('EJECUTIVO')}
                className={`py-1.5 px-2 rounded-lg border text-left flex items-center gap-1.5 font-bold transition-all ${
                  username === 'EJECUTIVO' 
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Gerente Ejecutivo</span>
              </button>
            </div>
          </div>

          {/* Botón de Ingreso TURQUESA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#22c1b4] hover:bg-teal-600 active:bg-teal-700 text-white font-black text-sm py-3.5 rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-150 transform hover:-translate-y-0.5 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Validando...' : 'Ingresar al Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Pie de Login Oficial */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-500 space-y-1">
          <div className="font-bold tracking-tight text-slate-600">
            DESARROLLADO POR GRUPO VEV, S.A. — DISTRIBUIDO POR ABBA INNOVATION S.A. PANAMÁ
          </div>
          <div className="font-black text-teal-700 uppercase tracking-wider text-[10px]">
            ICONWEBCONECT CENTRAL 2026 V.1.0
          </div>
        </div>
      </div>
    </div>
  );
}
