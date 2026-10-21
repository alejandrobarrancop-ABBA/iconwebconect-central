import React, { useState } from 'react';
import { UserPlus, Shield, User, Store, KeyRound, CheckCircle, Trash2, Edit2, ShieldAlert, Lock, Star } from 'lucide-react';

const INITIAL_USERS = [
  {
    id: 'usr-1',
    nombre: 'Administrador General',
    username: 'ADMIN',
    rol: 'ADMINISTRADOR',
    sucursal: 'ALL',
    sucursalNombre: 'Todas las Sucursales (Consolidado)',
    activo: true,
    fechaCreacion: '2026-10-21'
  },
  {
    id: 'usr-1b',
    nombre: 'Gerencia General Ejecutiva',
    username: 'EJECUTIVO',
    rol: 'GERENTE EJECUTIVO',
    sucursal: 'ALL',
    sucursalNombre: 'Todas las Sucursales (Consolidado)',
    activo: true,
    fechaCreacion: '2026-10-21'
  },
  {
    id: 'usr-2',
    nombre: 'Gerente Sucursal 1 (Local A)',
    username: 'GERENTE',
    rol: 'GERENTE',
    sucursal: 'goyurt-suc-01',
    sucursalNombre: 'GOYURT - Sucursal 1 (Local A)',
    activo: true,
    fechaCreacion: '2026-10-21'
  },
  {
    id: 'usr-2b',
    nombre: 'Gerente Sucursal 2 (Local B)',
    username: 'GERENTE2',
    rol: 'GERENTE',
    sucursal: 'goyurt-suc-02',
    sucursalNombre: 'GOYURT - Sucursal 2 (Local B)',
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
  const [nuevoRol, setNuevoRol] = useState('GERENTE EJECUTIVO');
  const [nuevaSucursal, setNuevaSucursal] = useState('ALL');

  const handleCrearUsuario = (e) => {
    e.preventDefault();
    if (!nuevoUsername.trim() || !nuevoPassword.trim()) return;

    // Validación de reglas de acceso por rol
    let branchAssigned = nuevaSucursal;
    if (nuevoRol === 'ADMINISTRADOR' || nuevoRol === 'GERENTE EJECUTIVO') {
      branchAssigned = 'ALL';
    } else if (branchAssigned === 'ALL') {
      branchAssigned = branches[0]?.id || 'goyurt-suc-01';
    }

    const sucursalObj = branches.find(b => b.id === branchAssigned);
    const sucursalNombre = branchAssigned === 'ALL' 
      ? 'Todas las Sucursales (Consolidado)' 
      : (sucursalObj ? sucursalObj.nombre : branchAssigned);

    const newUser = {
      id: `usr-${Date.now()}`,
      nombre: nuevoNombre.trim() || nuevoUsername.trim().toUpperCase(),
      username: nuevoUsername.trim().toUpperCase(),
      rol: nuevoRol,
      sucursal: branchAssigned,
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
    setNuevoRol('GERENTE EJECUTIVO');
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
            👑 ADMINISTRADOR TOTAL
          </span>
        );
      case 'GERENTE EJECUTIVO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
            ⭐ GERENTE EJECUTIVO (CONSOLIDADO)
          </span>
        );
      case 'GERENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
            📊 GERENTE DE SUCURSAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
            👤 USUARIO (OPERADOR)
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
            <Shield className="w-5 h-5 text-teal-600" />
            Control de Usuarios y Jerarquía de Accesos Web
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            <strong className="text-teal-700">ADMINISTRADOR:</strong> Acceso total (Consolidado + Configuración + Usuarios).<br/>
            <strong className="text-indigo-700">GERENTE EJECUTIVO:</strong> Acceso a todas las sucursales (Consolidado y Analítica) sin permisos de configuración ni creación de usuarios.<br/>
            <strong className="text-slate-700">GERENTE DE SUCURSAL / OPERADOR:</strong> Acceso restringido exclusivamente a su sucursal asignada.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#22c1b4] hover:bg-teal-600 active:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-teal-500/20 transition-all shrink-0"
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
                <th className="px-4 py-3">Alcance de Sucursales</th>
                <th className="px-4 py-3">Fecha Alta</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isGlobal = u.rol === 'ADMINISTRADOR' || u.rol === 'GERENTE EJECUTIVO';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">{u.username}</div>
                      <div className="text-[11px] text-slate-500">{u.nombre}</div>
                    </td>
                    <td className="px-4 py-3">
                      {getRoleBadge(u.rol)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        {isGlobal ? (
                          <span className={`px-2 py-0.5 rounded-lg border text-[11px] ${
                            u.rol === 'ADMINISTRADOR' 
                              ? 'text-teal-700 bg-teal-50 border-teal-200' 
                              : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                          }`}>
                            🌐 Todas las Sucursales (Consolidado)
                          </span>
                        ) : (
                          <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px] flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>{u.sucursalNombre || u.sucursal}</span>
                          </span>
                        )}
                      </div>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              <span>Registrar Usuario y Asignar Perfil</span>
            </h4>

            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Roberto Valencia"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: RVALENCIA"
                  value={nuevoUsername}
                  onChange={(e) => setNuevoUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-slate-800 uppercase font-mono"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rol / Permisos</label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => {
                      const r = e.target.value;
                      setNuevoRol(r);
                      if (r === 'ADMINISTRADOR' || r === 'GERENTE EJECUTIVO') {
                        setNuevaSucursal('ALL');
                      } else if (nuevaSucursal === 'ALL') {
                        setNuevaSucursal(branches[0]?.id || 'goyurt-suc-01');
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  >
                    <option value="GERENTE EJECUTIVO">⭐ Gerente Ejecutivo (Consolidado)</option>
                    <option value="GERENTE">📊 Gerente de Sucursal (Fija)</option>
                    <option value="USUARIO">👤 Usuario / Operador (Fija)</option>
                    <option value="ADMINISTRADOR">👑 Administrador Total</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sucursal Asignada</label>
                  <select
                    value={nuevaSucursal}
                    onChange={(e) => setNuevaSucursal(e.target.value)}
                    disabled={nuevoRol === 'ADMINISTRADOR' || nuevoRol === 'GERENTE EJECUTIVO'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-slate-800 disabled:opacity-60"
                  >
                    {(nuevoRol === 'ADMINISTRADOR' || nuevoRol === 'GERENTE EJECUTIVO') && (
                      <option value="ALL">🌐 Todas (Consolidado)</option>
                    )}
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {nuevoRol === 'GERENTE EJECUTIVO' && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 text-[11px] text-indigo-800">
                  <strong>Permisos Gerente Ejecutivo:</strong> Puede consultar métricas y reportes consolidados de todas las sucursales, pero <strong>no tiene acceso</strong> a crear usuarios ni a configuraciones de sistema.
                </div>
              )}

              {nuevoRol === 'GERENTE' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-[11px] text-blue-800">
                  <strong>Permisos Gerente de Sucursal:</strong> Solo puede consultar y analizar las ventas de su sucursal designada.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#22c1b4] hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20"
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
