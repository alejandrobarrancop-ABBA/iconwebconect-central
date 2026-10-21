import React, { useState } from 'react';
import { UserPlus, Shield, User, Store, KeyRound, CheckCircle, Trash2, Edit2, ShieldAlert } from 'lucide-react';

const INITIAL_USERS = [
  {
    id: 'usr-1',
    nombre: 'Administrador General',
    username: 'ADMIN',
    rol: 'ADMINISTRADOR',
    sucursal: 'ALL',
    sucursalNombre: 'Todas las Sucursales',
    activo: true,
    fechaCreacion: '2026-10-21'
  },
  {
    id: 'usr-2',
    nombre: 'Gerente de Operaciones',
    username: 'GERENTE',
    rol: 'GERENTE',
    sucursal: 'ALL',
    sucursalNombre: 'Todas las Sucursales',
    activo: true,
    fechaCreacion: '2026-10-21'
  },
  {
    id: 'usr-3',
    nombre: 'Cajero Local A',
    username: 'OPERADOR1',
    rol: 'USUARIO',
    sucursal: 'goyurt-suc-01',
    sucursalNombre: 'GOYURT - Sucursal 1 (Local A)',
    activo: true,
    fechaCreacion: '2026-10-21'
  },
  {
    id: 'usr-4',
    nombre: 'Cajero Local B',
    username: 'OPERADOR2',
    rol: 'USUARIO',
    sucursal: 'goyurt-suc-02',
    sucursalNombre: 'GOYURT - Sucursal 2 (Local B)',
    activo: true,
    fechaCreacion: '2026-10-21'
  }
];

export default function UsersManagementView({ branches = [] }) {
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('goyurt_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch (_) {
      return INITIAL_USERS;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoUsername, setNuevoUsername] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState('GERENTE');
  const [nuevaSucursal, setNuevaSucursal] = useState('ALL');

  const saveUsers = (updatedList) => {
    setUsers(updatedList);
    localStorage.setItem('goyurt_users', JSON.stringify(updatedList));
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!nuevoUsername.trim()) return;

    const branchObj = branches.find(b => b.id === nuevaSucursal);
    const newUser = {
      id: `usr-${Date.now()}`,
      nombre: nuevoNombre.trim() || nuevoUsername.toUpperCase(),
      username: nuevoUsername.trim().toUpperCase(),
      rol: nuevoRol,
      sucursal: nuevaSucursal,
      sucursalNombre: nuevaSucursal === 'ALL' ? 'Todas las Sucursales' : (branchObj?.nombre || nuevaSucursal),
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    saveUsers([...users, newUser]);
    setNuevoNombre('');
    setNuevoUsername('');
    setNuevoPassword('');
    setShowModal(false);
  };

  const toggleStatus = (id) => {
    const updated = users.map(u => u.id === id ? { ...u, activo: !u.activo } : u);
    saveUsers(updated);
  };

  const handleDelete = (id, username) => {
    if (username === 'ADMIN') {
      alert('El usuario ADMIN principal no puede ser eliminado.');
      return;
    }
    if (confirm(`¿Estás seguro de eliminar el usuario ${username}?`)) {
      saveUsers(users.filter(u => u.id !== id));
    }
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/30">👑 ADMINISTRADOR</span>;
      case 'GERENTE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#22c1b4]/10 text-[#22c1b4] border border-[#22c1b4]/30">📊 GERENTE</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/30">👤 OPERADOR</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Encabezado del Módulo */}
      <div className="bg-[#0b172d] border border-[#172d54] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#22c1b4]" />
            Control de Usuarios y Perfiles de Acceso Web
          </h3>
          <p className="text-xs text-slate-400">
            Administra quiénes tienen acceso al panel gerencial central y asigna sus niveles de permisos
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#22c1b4] to-teal-600 hover:from-teal-400 hover:to-teal-500 text-[#070f1e] font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-[#22c1b4]/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Nuevo Usuario</span>
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-[#0b172d] border border-[#172d54] rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto rounded-xl border border-[#172d54]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070f1e] text-slate-400 font-bold uppercase tracking-wider border-b border-[#172d54]">
              <tr>
                <th className="px-4 py-3">Usuario / Nombre</th>
                <th className="px-4 py-3">Rol / Nivel</th>
                <th className="px-4 py-3">Sucursal Asignada</th>
                <th className="px-4 py-3">Fecha Alta</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172d54]/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#102142]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-white text-sm">{u.username}</div>
                    <div className="text-[11px] text-slate-400">{u.nombre}</div>
                  </td>
                  <td className="px-4 py-3">
                    {getRoleBadge(u.rol)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-300">
                    {u.sucursalNombre}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {u.fechaCreacion}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                        u.activo
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {u.activo ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={u.username === 'ADMIN'}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b172d] border border-[#172d54] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="text-lg font-black text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#22c1b4]" />
              Crear Nuevo Usuario
            </h4>
            <p className="text-xs text-slate-400 mb-5">
              Configura el acceso para el personal de <strong>GOYURT</strong>
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Méndez"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Nombre de Usuario (Login)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: LAURA"
                  value={nuevoUsername}
                  onChange={(e) => setNuevoUsername(e.target.value)}
                  className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Contraseña Inicial
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Rol / Nivel
                  </label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                    className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="GERENTE">📊 GERENTE</option>
                    <option value="USUARIO">👤 OPERADOR</option>
                    <option value="ADMINISTRADOR">👑 ADMINISTRADOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Sucursal
                  </label>
                  <select
                    value={nuevaSucursal}
                    onChange={(e) => setNuevaSucursal(e.target.value)}
                    className="w-full bg-[#070f1e] border border-[#172d54] focus:border-[#22c1b4] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">🏢 Todas</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>📍 {b.codigo || b.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#172d54]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#22c1b4] to-teal-600 hover:from-teal-400 hover:to-teal-500 text-[#070f1e] font-black text-xs px-5 py-2 rounded-xl shadow-md transition-all"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
