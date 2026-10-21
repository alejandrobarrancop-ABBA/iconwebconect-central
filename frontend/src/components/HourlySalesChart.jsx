import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function HourlySalesChart({ data = [] }) {
  return (
    <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-black text-white">Curva de Afluencia y Horas Pico</h3>
        <p className="text-xs text-slate-400">Tráfico y montos vendidos por hora (10:00 a 22:00)</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSalesCentral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d6b" opacity={0.6} />
            <XAxis dataKey="horaLabel" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#060d1f', borderColor: '#1a2d6b', borderRadius: '0.75rem', color: '#fff' }}
              formatter={(value, name) => [name === 'total' ? `$${Number(value).toFixed(2)}` : value, name === 'total' ? 'Monto Vendido' : 'Tickets']}
            />
            <Area type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesCentral)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
