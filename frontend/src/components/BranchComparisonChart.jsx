import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function BranchComparisonChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-slate-400 text-xs">
        Sin datos de ventas en el período seleccionado
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-black text-slate-900">Comparativo de Ventas por Sucursal</h3>
        <p className="text-xs text-slate-500">Rendimiento consolidado Sucursal 1 vs Sucursal 2</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="nombre" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Ventas Totales']}
            />
            <Bar dataKey="total" fill="#059669" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
