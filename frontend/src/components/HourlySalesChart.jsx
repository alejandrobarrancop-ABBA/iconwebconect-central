import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function HourlySalesChart({ data = [] }) {
  return (
    <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">Curva de Afluencia y Ventas por Hora</h3>
        <p className="text-xs text-slate-400">Identificación de horas pico operativas (10:00 a 22:00)</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
            <XAxis dataKey="horaLabel" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.75rem', color: '#fff' }}
              formatter={(value, name) => [name === 'total' ? `$${Number(value).toFixed(2)}` : value, name === 'total' ? 'Monto Vendido' : 'Tickets']}
            />
            <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
