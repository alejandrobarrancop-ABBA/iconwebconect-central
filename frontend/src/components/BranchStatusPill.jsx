import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function BranchStatusPill({ branches = [], heartbeats = {} }) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-[#0b1530] border border-[#1a2d6b] px-4 py-2.5 rounded-2xl shadow-lg">
      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
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
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{branch.nombre}</span>
            <span className="text-[10px] font-bold opacity-80">
              {isOnline ? '🟢 En Línea' : '🔴 Desconectada'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
