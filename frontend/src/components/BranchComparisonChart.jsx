import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function BranchComparisonChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center min-h-[300px] text-slate-500">
        Sin datos de ventas en el período seleccionado
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">Comparativo de Ventas por Sucursal</h3>
        <p className="text-xs text-slate-400">Rendimiento consolidado por punto de venta</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
            <XAxis dataKey="nombre" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.75rem', color: '#fff' }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Ventas Totales']}
            />
            <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
