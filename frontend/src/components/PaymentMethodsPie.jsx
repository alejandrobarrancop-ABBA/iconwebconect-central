import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function PaymentMethodsPie({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center min-h-[300px] text-slate-500">
        Sin transacciones de pago en el período
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">Distribución por Método de Pago</h3>
        <p className="text-xs text-slate-400">Efectivo vs Tarjetas vs Pagos Móviles</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.75rem', color: '#fff' }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Monto Total']}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
