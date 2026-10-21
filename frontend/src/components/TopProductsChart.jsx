import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TopProductsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[300px] text-slate-500 text-xs">
        Sin artículos registrados en el período
      </div>
    );
  }

  return (
    <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-black text-white">Top 10 Productos Más Vendidos</h3>
        <p className="text-xs text-slate-400">Ranking por unidades e ingresos generados</p>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d6b" opacity={0.6} />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="descripcionCorta"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#060d1f', borderColor: '#1a2d6b', borderRadius: '0.75rem', color: '#fff' }}
              formatter={(value, name) => [
                name === 'unidades' ? `${value} unidades` : `$${Number(value).toFixed(2)}`,
                name === 'unidades' ? 'Cantidad' : 'Ingresos Totales'
              ]}
            />
            <Bar dataKey="unidades" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
