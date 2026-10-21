import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function HourlySalesChart({ data = [] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-black text-slate-900">Curva de Afluencia y Horas Pico</h3>
        <p className="text-xs text-slate-500">Tráfico y montos vendidos por hora (10:00 a 22:00)</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSalesCentral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="horaLabel" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value, name) => [name === 'total' ? `$${Number(value).toFixed(2)}` : value, name === 'total' ? 'Monto Vendido' : 'Tickets']}
            />
            <Area type="monotone" dataKey="total" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesCentral)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
