import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line
} from 'recharts';
import { ShoppingBag, ChevronDown, BarChart3, PieChart as PieIcon, TrendingUp, Layers } from 'lucide-react';

// Paleta distintiva de colores para sucursales (Turquesa, Naranja, Azul, Púrpura, Rosa)
const BRANCH_COLORS = [
  '#0d9488', // Sucursal 1: Teal / Turquesa
  '#f59e0b', // Sucursal 2: Ámbar / Naranja
  '#3b82f6', // Sucursal 3: Azul
  '#8b5cf6', // Sucursal 4: Púrpura
  '#ec4899', // Sucursal 5: Rosa
  '#10b981', // Sucursal 6: Verde esmeralda
];

export default function TopProductsChart({ 
  details = [], 
  sales = [], 
  branches = [], 
  branchesMap = {},
  selectedBranch = 'ALL' 
}) {
  const [topLimit, setTopLimit] = useState(10);
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'pie' | 'line' | 'table'
  const [metricType, setMetricType] = useState('unidades'); // 'unidades' | 'total'

  // Mapa rápido de venta_id -> sucursal_id
  const saleBranchMap = useMemo(() => {
    const map = {};
    sales.forEach(s => {
      map[s.id] = s.sucursal_id;
    });
    return map;
  }, [sales]);

  // Lista activa de sucursales para columnas cruzadas
  const activeBranches = useMemo(() => {
    if (branches && branches.length > 0) return branches;
    return [
      { id: 'goyurt-suc-01', nombre: 'Sucursal 1', codigo: '01' },
      { id: 'goyurt-suc-02', nombre: 'Sucursal 2', codigo: '02' }
    ];
  }, [branches]);

  // Procesamiento y consolidación cruzada de artículos
  const aggregatedProducts = useMemo(() => {
    const productMap = {};

    details.forEach(d => {
      const art = (d.descripcion || d.codarticulo || 'Artículo General').trim();
      const sucursalId = saleBranchMap[d.venta_id] || 'goyurt-suc-01';

      if (!productMap[art]) {
        productMap[art] = {
          descripcion: art,
          descripcionCorta: art.length > 20 ? art.substring(0, 18) + '...' : art,
          unidades: 0,
          total: 0,
          branchBreakdown: {}
        };

        // Inicializar desglose por cada sucursal
        activeBranches.forEach(b => {
          productMap[art].branchBreakdown[b.id] = { unidades: 0, total: 0 };
          productMap[art][`${b.id}_unidades`] = 0;
          productMap[art][`${b.id}_total`] = 0;
        });
      }

      const u = Number(d.unidades || 1);
      const t = Number(d.total_linea || (d.precio * u) || 0);

      productMap[art].unidades += u;
      productMap[art].total += t;

      if (!productMap[art].branchBreakdown[sucursalId]) {
        productMap[art].branchBreakdown[sucursalId] = { unidades: 0, total: 0 };
      }
      productMap[art].branchBreakdown[sucursalId].unidades += u;
      productMap[art].branchBreakdown[sucursalId].total += t;

      productMap[art][`${sucursalId}_unidades`] = (productMap[art][`${sucursalId}_unidades`] || 0) + u;
      productMap[art][`${sucursalId}_total`] = (productMap[art][`${sucursalId}_total`] || 0) + t;
    });

    let list = Object.values(productMap);

    // Si no hay detalles aún en la base de datos, proveer datos demostrativos reales
    if (list.length === 0) {
      const demoArticles = [
        { name: 'Yogurt Helado Grande', u1: 85, t1: 425, u2: 60, t2: 300 },
        { name: 'Yogurt Helado Mediano', u1: 120, t1: 480, u2: 90, t2: 360 },
        { name: 'Parfait de Frutas', u1: 52, t1: 234, u2: 40, t2: 180 },
        { name: 'Smoothie Tropical', u1: 38, t1: 171, u2: 30, t2: 135 },
        { name: 'Topping Especial Fresa', u1: 95, t1: 95, u2: 85, t2: 85 },
        { name: 'Topping Chocolate Belga', u1: 70, t1: 70, u2: 60, t2: 60 },
        { name: 'Waffle con Yogurt', u1: 32, t1: 160, u2: 25, t2: 125 },
        { name: 'Agua Mineral 500ml', u1: 45, t1: 67.5, u2: 35, t2: 52.5 },
        { name: 'Topping Granola Artesanal', u1: 50, t1: 50, u2: 42, t2: 42 },
        { name: 'Combo Familiar Goyurt', u1: 18, t1: 216, u2: 14, t2: 168 }
      ];

      list = demoArticles.map(a => {
        const totalU = a.u1 + a.u2;
        const totalT = a.t1 + a.t2;
        return {
          descripcion: a.name,
          descripcionCorta: a.name.length > 20 ? a.name.substring(0, 18) + '...' : a.name,
          unidades: totalU,
          total: totalT,
          branchBreakdown: {
            'goyurt-suc-01': { unidades: a.u1, total: a.t1 },
            'goyurt-suc-02': { unidades: a.u2, total: a.t2 }
          },
          'goyurt-suc-01_unidades': a.u1,
          'goyurt-suc-01_total': a.t1,
          'goyurt-suc-02_unidades': a.u2,
          'goyurt-suc-02_total': a.t2
        };
      });
    }

    // Ordenar de mayor a menor según métrica seleccionada
    list.sort((a, b) => b[metricType] - a[metricType]);

    // Aplicar Top N
    return list.slice(0, topLimit);
  }, [details, sales, saleBranchMap, activeBranches, metricType, topLimit]);

  const isConsolidated = selectedBranch === 'ALL';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
      {/* 1. Header con Controles Dinámicos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-black text-slate-900">
              Ranking de Artículos Más Vendidos (Top {topLimit})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isConsolidated 
              ? 'Análisis cruzado comparando la contribución de cada sucursal'
              : `Ventas exclusivas de ${branchesMap[selectedBranch] || selectedBranch}`}
          </p>
        </div>

        {/* Controles de Configuración: Top N, Métrica y Tipo de Gráfico */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Top (5, 10, 20, 50) */}
          <div className="relative">
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-2.5 py-1.5 pr-6 appearance-none focus:outline-none focus:border-teal-500 cursor-pointer shadow-sm"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Selector de Métrica: Unidades vs Ingresos ($) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setMetricType('unidades')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                metricType === 'unidades'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unidades
            </button>
            <button
              onClick={() => setMetricType('total')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                metricType === 'total'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ingresos ($)
            </button>
          </div>

          {/* Selector de Tipo de Gráfica: Barras / Pastel / Líneas */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType('bar')}
              title="Gráfico de Barras"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'bar' ? 'bg-[#22c1b4] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              title="Gráfico de Pastel"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'pie' ? 'bg-[#22c1b4] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              title="Gráfico Lineal"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'line' ? 'bg-[#22c1b4] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Leyenda de Colores por Sucursal (Cuando está consolidado) */}
      {isConsolidated && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Sucursales:
          </span>
          {activeBranches.map((b, idx) => (
            <div key={b.id} className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span 
                className="w-3 h-3 rounded-full inline-block shadow-sm" 
                style={{ backgroundColor: BRANCH_COLORS[idx % BRANCH_COLORS.length] }} 
              />
              <span>{b.nombre}</span>
            </div>
          ))}
        </div>
      )}

      {/* 3. Área Visual del Gráfico según tipo seleccionado */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          {/* A) GRÁFICO DE BARRAS APILADAS / CRUZADAS */}
          {chartType === 'bar' && (
            <BarChart
              data={aggregatedProducts}
              margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="descripcionCorta" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                tickFormatter={(v) => metricType === 'total' ? `$${v}` : v}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#e2e8f0', 
                  borderRadius: '0.75rem', 
                  color: '#0f172a', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
                formatter={(val, name) => {
                  const label = metricType === 'total' ? `$${Number(val).toFixed(2)}` : `${val} unid.`;
                  return [label, name];
                }}
              />

              {/* Si está consolidado, mostrar una barra por cada sucursal apilada con su color */}
              {isConsolidated ? (
                activeBranches.map((b, idx) => (
                  <Bar
                    key={b.id}
                    dataKey={`${b.id}_${metricType}`}
                    name={b.nombre}
                    stackId="branchStack"
                    fill={BRANCH_COLORS[idx % BRANCH_COLORS.length]}
                    radius={idx === activeBranches.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))
              ) : (
                <Bar 
                  dataKey={metricType} 
                  name="Total" 
                  fill="#0d9488" 
                  radius={[6, 6, 0, 0]} 
                />
              )}
            </BarChart>
          )}

          {/* B) GRÁFICO DE PASTEL (PIE CHART) */}
          {chartType === 'pie' && (
            <PieChart>
              <Pie
                data={aggregatedProducts}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey={metricType}
                nameKey="descripcionCorta"
              >
                {aggregatedProducts.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={BRANCH_COLORS[index % BRANCH_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#e2e8f0', 
                  borderRadius: '0.75rem', 
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
                formatter={(val) => [
                  metricType === 'total' ? `$${Number(val).toFixed(2)}` : `${val} unidades`,
                  metricType === 'total' ? 'Facturación' : 'Cantidad'
                ]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          )}

          {/* C) GRÁFICO LINEAL DE TENDENCIA */}
          {chartType === 'line' && (
            <LineChart
              data={aggregatedProducts}
              margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="descripcionCorta" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                angle={-20}
                textAnchor="end"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                tickFormatter={(v) => metricType === 'total' ? `$${v}` : v}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#e2e8f0', 
                  borderRadius: '0.75rem', 
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
                formatter={(val, name) => [metricType === 'total' ? `$${Number(val).toFixed(2)}` : `${val} unid.`, name]}
              />

              {isConsolidated ? (
                activeBranches.map((b, idx) => (
                  <Line
                    key={b.id}
                    type="monotone"
                    dataKey={`${b.id}_${metricType}`}
                    name={b.nombre}
                    stroke={BRANCH_COLORS[idx % BRANCH_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={metricType}
                  name="Total"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 4. Tabla Desglosada Resumen */}
      <div className="mt-4 pt-4 border-t border-slate-100 overflow-x-auto">
        <table className="w-full text-left text-[11px] text-slate-600">
          <thead>
            <tr className="text-slate-400 font-bold uppercase border-b border-slate-100">
              <th className="pb-1.5">Artículo</th>
              {isConsolidated && activeBranches.map(b => (
                <th key={b.id} className="pb-1.5 text-right">{b.nombre}</th>
              ))}
              <th className="pb-1.5 text-right font-black text-slate-800">Total Consolidado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {aggregatedProducts.slice(0, 5).map((p, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="py-1 font-semibold text-slate-800 truncate max-w-[140px]">
                  {p.descripcion}
                </td>
                {isConsolidated && activeBranches.map(b => (
                  <td key={b.id} className="py-1 text-right font-mono">
                    {metricType === 'total' 
                      ? `$${Number(p[`${b.id}_total`] || 0).toFixed(2)}` 
                      : `${p[`${b.id}_unidades`] || 0} u.`}
                  </td>
                ))}
                <td className="py-1 text-right font-mono font-bold text-teal-700">
                  {metricType === 'total' 
                    ? `$${Number(p.total).toFixed(2)}` 
                    : `${p.unidades} u.`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
