import React from 'react';
import { DollarSign, CreditCard, Receipt, Calendar, ArrowUpRight } from 'lucide-react';

export default function CierresView({ cierres = [], branchesMap = {} }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              Cierres de Caja Diarios (Cortes Z)
            </h3>
            <p className="text-xs text-slate-400">
              Control de cuadre de cajas y arqueos sincronizados desde cada sucursal ICG
            </p>
          </div>
        </div>

        {/* Tabla de Cierres */}
        <div className="overflow-x-auto rounded-xl border border-[#1a2d6b]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#060d1f] text-slate-400 font-bold uppercase tracking-wider border-b border-[#1a2d6b]">
              <tr>
                <th className="px-4 py-3">Punto de Venta</th>
                <th className="px-4 py-3">N° Cierre</th>
                <th className="px-4 py-3">Fecha / Hora</th>
                <th className="px-4 py-3 text-right">Efectivo</th>
                <th className="px-4 py-3 text-right">Tarjetas</th>
                <th className="px-4 py-3 text-right">Total Ventas</th>
                <th className="px-4 py-3 text-center">Estado Cuadre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2d6b]/60">
              {cierres.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-semibold text-slate-300">Sin cierres Z registrados aún</p>
                      <p className="text-[11px] text-slate-500">
                        Los cortes Z se sincronizan automáticamente cada vez que el cajero realiza el cierre del día en ICG FrontRest.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                cierres.map((c) => (
                  <tr key={c.id} className="hover:bg-[#111f4a]/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      {branchesMap[c.sucursal_id] || c.sucursal_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-400 font-bold">
                      #{c.numcierre}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(c.fecha_cierre).toLocaleString('es-PA')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200">
                      ${Number(c.total_efectivo || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200">
                      ${Number(c.total_tarjeta || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      ${Number(c.total_ventas || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        CUADRADO
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
