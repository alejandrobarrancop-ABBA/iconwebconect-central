import React, { useState } from 'react';
import { Lock, User, ArrowRight, AlertCircle, BarChart3, Building2, Store } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('ADMIN');
  const [password, setPassword] = useState('1234');
  const [role, setRole] = useState('ADMINISTRADOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
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

      if ((u === 'ADMIN' && p === '1234') || 
          (u === 'EJECUTIVO' && p === '1234') || 
          (u === 'GERENTE' && p === '1234') || 
          (u === 'GERENTE1' && p === '1234') || 
          (u === 'GERENTE2' && p === '1234') || 
          (u === 'USUARIO' && p === '1234') || 
          (u === 'OPERADOR1' && p === '1234') || 
          (u === 'OPERADOR2' && p === '1234') || 
          matchUser) {
        
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
          rol: role || detectedRole,
          sucursal: (role === 'ADMINISTRADOR' || role === 'GERENTE EJECUTIVO') ? 'ALL' : assignedSucursal,
          empresa: 'GOYURT PANAMÁ'
        };

        localStorage.setItem('iconweb_user', JSON.stringify(userObj));
        onLoginSuccess(userObj);
      } else {
        setError('Credenciales incorrectas. Pruebe con ADMIN / 1234');
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
      {/* Resplandores suaves en fondo blanco */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/70 relative z-10">
        {/* Encabezado con Logo Oficial ICONWEBCONECT (Gráfico Verde Analítica) */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 shadow-lg shadow-teal-500/25 mb-3 border-2 border-white">
            <BarChart3 className="w-9 h-9 text-white stroke-[2.5]" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            ICONWEBCONECT
          </h1>

          <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-black uppercase tracking-wider">
            PLATAFORMA GERENCIAL CENTRAL
          </div>

          {/* Nombre y Logo de la Empresa Cliente */}
          <div className="mt-3.5 flex items-center justify-center gap-2 bg-slate-50 py-1.5 px-3 rounded-2xl border border-slate-200 shadow-sm max-w-xs mx-auto">
            <img
              src="/goyurt-logo.png"
              alt="Goyurt"
              className="h-5 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="text-xs text-slate-700 font-bold">GOYURT PANAMÁ</span>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Consolidación y Analítica de Ventas Multi-Sucursal en la Nube
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
                placeholder="ADMIN"
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

          {/* Rol / Perfil de Acceso */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Perfil / Nivel de Acceso
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ADMINISTRADOR', label: 'Admin', desc: 'Consolidado + Ajustes' },
                { id: 'GERENTE EJECUTIVO', label: 'Gerente Ejecutivo', desc: 'Consolidado (Sin Ajustes)' },
                { id: 'GERENTE', label: 'Gerente Local', desc: 'Solo su Sucursal' },
                { id: 'USUARIO', label: 'Operador TPV', desc: 'Solo su Sucursal' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                    role === r.id
                      ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm ring-1 ring-teal-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <div className="font-extrabold">{r.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Botón de Ingreso TURQUESA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#22c1b4] hover:bg-teal-600 active:bg-teal-700 text-white font-black text-sm py-3 rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-150 transform hover:-translate-y-0.5 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Validando...' : 'Ingresar al Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Acceso Rápido / Información de Credenciales */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Accesos configurados:</p>
          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px]">
            <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200 font-bold">ADMIN / 1234</span>
            <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200 font-bold">EJECUTIVO / 1234</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">GERENTE / 1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}
