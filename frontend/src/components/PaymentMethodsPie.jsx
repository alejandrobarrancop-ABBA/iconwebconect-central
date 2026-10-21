import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function PaymentMethodsPie({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[300px] text-slate-500 text-xs">
        Sin transacciones de pago en el período
      </div>
    );
  }

  return (
    <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-black text-white">Distribución por Método de Pago</h3>
        <p className="text-xs text-slate-400">Efectivo vs Tarjetas vs Pagos Digitales</p>
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
              contentStyle={{ backgroundColor: '#060d1f', borderColor: '#1a2d6b', borderRadius: '0.75rem', color: '#fff' }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Monto Total']}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
