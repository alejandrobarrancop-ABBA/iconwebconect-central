import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function BranchStatusPill({ branches = [], heartbeats = {} }) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 backdrop-blur border border-slate-700/60 px-4 py-2.5 rounded-xl">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Estado de Puntos de Venta:
      </span>
      {branches.map(branch => {
        const hb = heartbeats[branch.id];
        const isOnline = hb && (new Date() - new Date(hb.ultimo_ping)) < 3 * 60 * 1000; // Menor a 3 min

        return (
          <div
            key={branch.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{branch.nombre}</span>
            <span className="text-[10px] opacity-75">
              {isOnline ? '🟢 En Línea' : '🔴 Desconectada'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
