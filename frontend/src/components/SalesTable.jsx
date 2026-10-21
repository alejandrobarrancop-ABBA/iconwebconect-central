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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Auditoría de Ventas y Tickets Sincronizados
          </h3>
          <p className="text-xs text-slate-500">Detalle transaccional en tiempo real desde las cajas locales de ICG</p>
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
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 focus:bg-white w-48 sm:w-64"
            />
          </div>

          {/* Botón Exportar CSV VERDE */}
          <button
            onClick={exportToCsv}
            disabled={filteredSales.length === 0}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Sucursal</th>
              <th className="px-4 py-3">Serie / N°</th>
              <th className="px-4 py-3">Fecha y Hora</th>
              <th className="px-4 py-3 text-right">Neto sin IVA</th>
              <th className="px-4 py-3 text-right">IVA</th>
              <th className="px-4 py-3 text-right">Total Cobrado</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                  No se encontraron ventas para los filtros seleccionados
                </td>
              </tr>
            ) : (
              filteredSales.slice(0, 50).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {branchesMap[s.sucursal_id] || s.sucursal_id}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {s.serie}-{s.numero}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(s.fecha_hora).toLocaleString('es-PA')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    ${Number(s.total_neto || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">
                    ${Number(s.total_iva || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                    ${Number(s.total || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Sincronizado
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Mostrando hasta 50 tickets más recientes</span>
        <span>Total registros: {filteredSales.length}</span>
      </div>
    </div>
  );
}
