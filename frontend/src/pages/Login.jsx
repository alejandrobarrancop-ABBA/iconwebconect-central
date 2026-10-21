import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

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

      // Permitir cualquier usuario del sistema o por defecto ADMIN/1234
      const savedUsersRaw = localStorage.getItem('goyurt_users');
      let registeredUsers = [];
      try {
        if (savedUsersRaw) registeredUsers = JSON.parse(savedUsersRaw);
      } catch (_) {}

      const matchUser = registeredUsers.find(ru => ru.username === u && ru.activo);

      if ((u === 'ADMIN' && p === '1234') || (u === 'GERENTE' && p === '1234') || (u === 'USUARIO' && p === '1234') || (u === 'OPERADOR1' && p === '1234') || (u === 'OPERADOR2' && p === '1234') || matchUser) {
        const detectedRole = matchUser ? matchUser.rol : (u === 'ADMIN' ? 'ADMINISTRADOR' : (u === 'GERENTE' ? 'GERENTE' : 'USUARIO'));
        const userObj = {
          username: u,
          nombre: matchUser ? matchUser.nombre : (u === 'ADMIN' ? 'Administrador General' : (u === 'GERENTE' ? 'Gerente de Operaciones' : 'Operador de Sucursal')),
          rol: role || detectedRole,
          empresa: 'GOYURT PANAMÁ'
        };
        localStorage.setItem('iconweb_user', JSON.stringify(userObj));
        onLoginSuccess(userObj);
      } else {
        setError('Credenciales incorrectas. Pruebe con ADMIN / 1234');
        setLoading(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070f1e] p-4 font-sans relative overflow-hidden">
      {/* Resplandores turquesa GOYURT en el fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#22c1b4]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0b172d] border border-[#172d54] rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Encabezado con Logo Oficial de Goyurt */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-3xl shadow-xl border border-slate-200 mb-4">
            <img
              src="/goyurt-logo.png"
              alt="GOYURT"
              className="h-14 w-auto object-contain mx-auto"
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ICONWEBCONECT</h1>
          <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-[#22c1b4]/15 border border-[#22c1b4]/30 text-[#22c1b4] text-xs font-black uppercase tracking-widest">
            PLATAFORMA GERENCIAL CENTRAL
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Consolidación y Analítica de Ventas Multi-Sucursal en la Nube
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
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
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
                className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
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
                className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Perfil de Acceso */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Perfil / Rol
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl pl-10 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer transition-colors font-medium"
              >
                <option value="ADMINISTRADOR">👑 Administrador (Acceso Total + Usuarios)</option>
                <option value="GERENTE">📊 Gerente (Dashboard + Reportes IA)</option>
                <option value="USUARIO">👤 Operador de Sucursal (Solo Consulta)</option>
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
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#22c1b4] to-teal-600 hover:from-teal-400 hover:to-teal-500 text-[#070f1e] font-black py-3 px-4 rounded-xl shadow-lg shadow-[#22c1b4]/30 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Accediendo...' : 'Ingresar al Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Nota de credenciales por defecto */}
        <div className="mt-6 pt-5 border-t border-[#172d54] text-center">
          <p className="text-xs text-slate-400">
            Acceso por defecto: <strong className="text-[#22c1b4] font-mono">ADMIN</strong> / <strong className="text-[#22c1b4] font-mono">1234</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
