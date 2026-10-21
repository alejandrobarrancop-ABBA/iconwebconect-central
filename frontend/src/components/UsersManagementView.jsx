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
  const [nuevoRol, setNuevoRol] = useState('USUARIO');
  const [nuevaSucursal, setNuevaSucursal] = useState('ALL');

  const handleCrearUsuario = (e) => {
    e.preventDefault();
    if (!nuevoUsername.trim() || !nuevoPassword.trim()) return;

    const sucursalObj = branches.find(b => b.id === nuevaSucursal);
    const sucursalNombre = nuevaSucursal === 'ALL' ? 'Todas las Sucursales' : (sucursalObj ? sucursalObj.nombre : nuevaSucursal);

    const newUser = {
      id: `usr-${Date.now()}`,
      nombre: nuevoNombre.trim() || nuevoUsername.trim().toUpperCase(),
      username: nuevoUsername.trim().toUpperCase(),
      rol: nuevoRol,
      sucursal: nuevaSucursal,
      sucursalNombre,
      activo: true,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    localStorage.setItem('goyurt_users', JSON.stringify(updated));

    // Limpiar formulario y cerrar modal
    setNuevoNombre('');
    setNuevoUsername('');
    setNuevoPassword('');
    setNuevoRol('USUARIO');
    setNuevaSucursal('ALL');
    setShowModal(false);
  };

  const toggleStatus = (id) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, activo: !u.activo };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem('goyurt_users', JSON.stringify(updated));
  };

  const handleDelete = (id, username) => {
    if (username === 'ADMIN') {
      alert('El usuario ADMIN principal del sistema no puede ser eliminado.');
      return;
    }
    if (confirm(`¿Está seguro de eliminar el usuario ${username}?`)) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('goyurt_users', JSON.stringify(updated));
    }
  };

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            👑 ADMINISTRADOR
          </span>
        );
      case 'GERENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
            📊 GERENTE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
            👤 USUARIO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Encabezado del Módulo */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Control de Usuarios y Perfiles de Acceso Web
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Administra quiénes tienen acceso al panel gerencial central de <strong>GOYURT PANAMÁ</strong> y asigna sus niveles de permisos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Nuevo Usuario</span>
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Usuario / Nombre</th>
                <th className="px-4 py-3">Rol / Nivel</th>
                <th className="px-4 py-3">Sucursal Asignada</th>
                <th className="px-4 py-3">Fecha Alta</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 text-sm">{u.username}</div>
                    <div className="text-[11px] text-slate-500">{u.nombre}</div>
                  </td>
                  <td className="px-4 py-3">
                    {getRoleBadge(u.rol)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
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
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {u.activo ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={u.username === 'ADMIN'}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>Registrar Nuevo Usuario</span>
            </h4>

            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Méndez"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: LAURA"
                  value={nuevoUsername}
                  onChange={(e) => setNuevoUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rol / Permisos</label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="ADMINISTRADOR">Administrador</option>
                    <option value="GERENTE">Gerente</option>
                    <option value="USUARIO">Usuario / Cajero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sucursal Asignada</label>
                  <select
                    value={nuevaSucursal}
                    onChange={(e) => setNuevaSucursal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="ALL">Todas las Sucursales</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
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
