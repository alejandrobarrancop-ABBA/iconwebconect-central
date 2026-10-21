import React, { useState } from 'react';
import { Download, Search, FileText } from 'lucide-react';

export default function SalesTable({ sales = [], branchesMap = {} }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    const serieNum = `${s.serie}-${s.numero}`.toLowerCase();
    const sucursalNom = (branchesMap[s.sucursal_id] || '').toLowerCase();
    return serieNum.includes(term) || sucursalNom.includes(term);
  });

  const exportToCsv = () => {
    if (filteredSales.length === 0) return;
    const headers = ['ID', 'Sucursal', 'Serie', 'Numero', 'Fecha_Hora', 'Total_Neto', 'Total_IVA', 'Total'];
    const rows = filteredSales.map(s => [
      s.id,
      branchesMap[s.sucursal_id] || s.sucursal_id,
      s.serie,
      s.numero,
      s.fecha_hora,
      s.total_neto,
      s.total_iva,
      s.total
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ventas_goyurt_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Auditoría de Ventas y Tickets Sincronizados
          </h3>
          <p className="text-xs text-slate-400">Detalle transaccional en tiempo real desde las cajas locales</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Buscador */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ticket o sucursal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
            />
          </div>

          {/* Botón Exportar Excel/CSV */}
          <button
            onClick={exportToCsv}
            disabled={filteredSales.length === 0}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
            title="Exportar a CSV para Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
            <tr>
              <th className="px-4 py-3">Punto de Venta / Sucursal</th>
              <th className="px-4 py-3">Serie y Ticket</th>
              <th className="px-4 py-3">Fecha y Hora</th>
              <th className="px-4 py-3 text-right">Subtotal Neto</th>
              <th className="px-4 py-3 text-right">ITBMS (7%)</th>
              <th className="px-4 py-3 text-right">Total Cobrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                  No se encontraron ventas para los filtros seleccionados
                </td>
              </tr>
            ) : (
              filteredSales.slice(0, 50).map((s) => (
                <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-200">
                    {branchesMap[s.sucursal_id] || s.sucursal_id}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-emerald-400 font-bold">
                    {s.serie}-{s.numero}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">
                    {new Date(s.fecha_hora).toLocaleString('es-PA', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    ${Number(s.total_neto || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-400">
                    ${Number(s.total_iva || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-white">
                    ${Number(s.total || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filteredSales.length > 50 && (
        <p className="text-[11px] text-slate-500 mt-2 text-right">
          Mostrando los primeros 50 registros de {filteredSales.length}. Usa Exportar CSV para el reporte completo.
        </p>
      )}
    </div>
  );
}
