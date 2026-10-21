import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TopProductsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-slate-400 text-xs">
        Sin artículos registrados en el período
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-black text-slate-900">Top 10 Productos Más Vendidos</h3>
        <p className="text-xs text-slate-500">Ranking por unidades e ingresos generados</p>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="descripcionCorta"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value, name) => [
                name === 'unidades' ? `${value} unidades` : `$${Number(value).toFixed(2)}`,
                name === 'unidades' ? 'Cantidad' : 'Ingresos Totales'
              ]}
            />
            <Bar dataKey="unidades" fill="#10b981" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
