import React, { useState } from 'react';
import { Lock, User, BarChart3, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

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

      // Validación de credenciales
      if ((u === 'ADMIN' && p === '1234') || (u === 'GERENTE' && p === '1234') || (u === 'USUARIO' && p === '1234')) {
        const detectedRole = u === 'ADMIN' ? 'ADMINISTRADOR' : (u === 'GERENTE' ? 'GERENTE' : 'USUARIO');
        const userObj = {
          username: u,
          nombre: u === 'ADMIN' ? 'Administrador General' : (u === 'GERENTE' ? 'Gerente de Operaciones' : 'Operador de Sucursal'),
          rol: role || detectedRole,
          empresa: 'GOYURT PANAMÁ'
        };
        localStorage.setItem('iconweb_user', JSON.stringify(userObj));
        onLoginSuccess(userObj);
      } else {
        setError('Usuario o contraseña incorrectos. Utilice ADMIN / 1234');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060d1f] p-4 font-sans relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Encabezado del Login */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 mb-4 shadow-lg shadow-blue-900/40">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ICONWEBCONECT</h1>
          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            CENTRAL NUBE
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Plataforma Gerencial y Consolidación Multi-Sucursal para <strong>GOYURT</strong>
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
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
                className="w-full bg-[#060d1f] border border-[#1a2d6b] focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
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
                className="w-full bg-[#060d1f] border border-[#1a2d6b] focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Perfil de Acceso */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Perfil / Rol
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#060d1f] border border-[#1a2d6b] focus:border-blue-500 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                <option value="ADMINISTRADOR">👑 Administrador (Acceso Total + Config)</option>
                <option value="GERENTE">📊 Gerente (Dashboard + Reportes Ventas)</option>
                <option value="USUARIO">👤 Usuario / Operador (Solo Consulta)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Botón de Ingreso */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/40 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Accediendo...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Nota de credenciales por defecto */}
        <div className="mt-6 pt-5 border-t border-[#1a2d6b] text-center">
          <p className="text-xs text-slate-400">
            Acceso por defecto: <strong className="text-amber-400 font-mono">ADMIN</strong> / <strong className="text-amber-400 font-mono">1234</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
