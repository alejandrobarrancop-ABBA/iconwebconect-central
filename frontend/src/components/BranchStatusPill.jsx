import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function BranchStatusPill({ branches = [], heartbeats = {} }) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        Estado Puntos de Venta (ICG):
      </span>
      {branches.map(branch => {
        const hb = heartbeats[branch.id];
        const isOnline = hb && (new Date() - new Date(hb.ultimo_ping)) < 3 * 60 * 1000;

        return (
          <div
            key={branch.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span className="font-bold">{branch.nombre}</span>
            <span className="text-[10px] font-bold opacity-90">
              {isOnline ? '🟢 En Línea' : '🔴 Desconectada'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
