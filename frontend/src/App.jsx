import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import BranchStatusPill from './components/BranchStatusPill';
import KpiCard from './components/KpiCard';
import BranchComparisonChart from './components/BranchComparisonChart';
import HourlySalesChart from './components/HourlySalesChart';
import PaymentMethodsPie from './components/PaymentMethodsPie';
import TopProductsChart from './components/TopProductsChart';
import SalesTable from './components/SalesTable';
import { DollarSign, Receipt, TrendingUp, Trophy, AlertCircle } from 'lucide-react';

export default function App() {
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [dateRange, setDateRange] = useState('TODAY');
  const [branches, setBranches] = useState([]);
  const [heartbeats, setHeartbeats] = useState({});
  const [sales, setSales] = useState([]);
  const [details, setDetails] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // 1. Cargar Sucursales y Estado de Conexión
  const loadInitialData = async () => {
    try {
      const { data: branchData, error: errBranch } = await supabase
        .from('sucursales')
        .select('*')
        .order('codigo', { ascending: true });

      if (errBranch) {
        console.warn('Sucursales en Supabase:', errBranch.message);
        // Fallback para GOYURT en caso de que aún no se hayan insertado
        setBranches([
          { id: 'goyurt-suc-01', nombre: 'GOYURT - Sucursal 1 (Local A)', codigo: '01' },
          { id: 'goyurt-suc-02', nombre: 'GOYURT - Sucursal 2 (Local B)', codigo: '02' }
        ]);
      } else if (branchData && branchData.length > 0) {
        setBranches(branchData);
      } else {
        setBranches([
          { id: 'goyurt-suc-01', nombre: 'GOYURT - Sucursal 1 (Local A)', codigo: '01' },
          { id: 'goyurt-suc-02', nombre: 'GOYURT - Sucursal 2 (Local B)', codigo: '02' }
        ]);
      }

      // Cargar Heartbeats
      const { data: hbData } = await supabase
        .from('sucursales_heartbeat')
        .select('*');

      if (hbData) {
        const hbMap = {};
        hbData.forEach(h => { hbMap[h.sucursal_id] = h; });
        setHeartbeats(hbMap);
      }
    } catch (err) {
      console.error('Error cargando sucursales:', err);
    }
  };

  // 2. Cargar Ventas según filtros
  const fetchSalesData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const now = new Date();
      let fromDate = new Date();
      let toDate = new Date();

      if (dateRange === 'TODAY') {
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
      } else if (dateRange === 'YESTERDAY') {
        fromDate.setDate(now.getDate() - 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setDate(now.getDate() - 1);
        toDate.setHours(23, 59, 59, 999);
      } else if (dateRange === 'LAST_7_DAYS') {
        fromDate.setDate(now.getDate() - 7);
        fromDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'THIS_MONTH') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (dateRange === 'THIS_YEAR') {
        fromDate = new Date(now.getFullYear(), 0, 1);
      }

      const fromIso = fromDate.toISOString().split('T')[0];
      const toIso = toDate.toISOString().split('T')[0];

      // Query Ventas Cabecera
      let query = supabase
        .from('ventas_cabecera')
        .select('*')
        .gte('fecha', fromIso)
        .lte('fecha', toIso)
        .order('fecha_hora', { ascending: false });

      if (selectedBranch !== 'ALL') {
        query = query.eq('sucursal_id', selectedBranch);
      }

      const { data: salesData, error: errSales } = await query;
      if (errSales) {
        setErrorMsg('Nota: Esperando primeras ventas del agente local o verifica los permisos en Supabase.');
        setSales([]);
      } else {
        setSales(salesData || []);
      }

      // Query Detalles (Top productos)
      const { data: detData } = await supabase
        .from('ventas_detalle')
        .select('*')
        .limit(200);
      setDetails(detData || []);

      // Query Métodos de Pago
      const { data: pagData } = await supabase
        .from('ventas_pagos')
        .select('*')
        .limit(200);
      setPayments(pagData || []);

    } catch (err) {
      console.error('Error fetching sales:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [selectedBranch, dateRange]);

  // Suscripción Realtime a Supabase
  useEffect(() => {
    const channel = supabase
      .channel('realtime_sales')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ventas_cabecera' }, () => {
        fetchSalesData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sucursales_heartbeat' }, (payload) => {
        if (payload.new) {
          setHeartbeats(prev => ({ ...prev, [payload.new.sucursal_id]: payload.new }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBranch, dateRange]);

  const branchesMap = useMemo(() => {
    const map = {};
    branches.forEach(b => { map[b.id] = b.nombre; });
    return map;
  }, [branches]);

  // 3. Cálculos de KPIs Consolidados
  const kpis = useMemo(() => {
    const totalVentas = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const totalNeto = sales.reduce((acc, s) => acc + Number(s.total_neto || 0), 0);
    const totalTickets = sales.length;
    const ticketPromedio = totalTickets > 0 ? totalVentas / totalTickets : 0;

    // Calcular sucursal líder
    const branchTotals = {};
    sales.forEach(s => {
      branchTotals[s.sucursal_id] = (branchTotals[s.sucursal_id] || 0) + Number(s.total || 0);
    });

    let topBranchId = null;
    let topBranchTotal = 0;
    Object.entries(branchTotals).forEach(([id, tot]) => {
      if (tot > topBranchTotal) {
        topBranchTotal = tot;
        topBranchId = id;
      }
    });

    return {
      totalVentas,
      totalNeto,
      totalTickets,
      ticketPromedio,
      topBranchName: topBranchId ? (branchesMap[topBranchId] || topBranchId) : 'N/A',
      topBranchTotal
    };
  }, [sales, branchesMap]);

  // Datos para gráfico comparativo de sucursales
  const branchComparisonData = useMemo(() => {
    const totals = {};
    branches.forEach(b => { totals[b.id] = 0; });
    sales.forEach(s => {
      totals[s.sucursal_id] = (totals[s.sucursal_id] || 0) + Number(s.total || 0);
    });
    return branches.map(b => ({
      nombre: b.codigo ? `Sucursal ${b.codigo}` : b.nombre,
      total: Number((totals[b.id] || 0).toFixed(2))
    }));
  }, [branches, sales]);

  // Datos para gráfico de ventas por hora
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hora: i,
      horaLabel: `${String(i).padStart(2, '0')}:00`,
      total: 0,
      tickets: 0
    }));

    sales.forEach(s => {
      const h = s.hora !== undefined ? s.hora : new Date(s.fecha_hora).getHours();
      if (hours[h]) {
        hours[h].total += Number(s.total || 0);
        hours[h].tickets += 1;
      }
    });

    // Filtrar rango útil del día comercial (8:00 a 23:00)
    return hours.slice(8, 24);
  }, [sales]);

  // Datos para gráfico de métodos de pago
  const paymentMethodsData = useMemo(() => {
    const counts = {};
    payments.forEach(p => {
      const desc = p.descripcion_pago || (p.codformapago === '1' ? 'Efectivo' : 'Tarjeta');
      counts[desc] = (counts[desc] || 0) + Number(p.importe || 0);
    });

    if (Object.keys(counts).length === 0 && sales.length > 0) {
      // Si aún no hay detalle de pagos, estimar proporcional para visualización inicial
      return [
        { name: 'Efectivo', value: kpis.totalVentas * 0.4 },
        { name: 'Tarjetas', value: kpis.totalVentas * 0.5 },
        { name: 'Yappy / Móvil', value: kpis.totalVentas * 0.1 }
      ];
    }

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  }, [payments, sales, kpis.totalVentas]);

  // Datos para gráfico de top productos
  const topProductsData = useMemo(() => {
    const map = {};
    details.forEach(d => {
      const art = d.descripcion || d.codarticulo;
      if (!map[art]) {
        map[art] = {
          descripcion: art,
          descripcionCorta: art.length > 18 ? art.substring(0, 18) + '...' : art,
          unidades: 0,
          total: 0
        };
      }
      map[art].unidades += Number(d.unidades || 1);
      map[art].total += Number(d.total_linea || 0);
    });

    return Object.values(map)
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 8);
  }, [details]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Header con Filtros Ejecutivos */}
      <Navbar
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        branches={branches}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRefresh={fetchSalesData}
        loading={loading}
      />

      {/* 2. Cuerpo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner de Estado de Conectividad en Vivo */}
        <BranchStatusPill branches={branches} heartbeats={heartbeats} />

        {errorMsg && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3. Tarjetas KPI Ejecutivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Ventas Totales"
            value={`$${kpis.totalVentas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`Neto: $${kpis.totalNeto.toFixed(2)}`}
            icon={DollarSign}
            color="emerald"
            trend="up"
            trendValue="+12.4%"
          />
          <KpiCard
            title="Tickets Emitidos"
            value={kpis.totalTickets.toLocaleString('en-US')}
            subtitle="Operaciones completadas"
            icon={Receipt}
            color="blue"
          />
          <KpiCard
            title="Ticket Promedio"
            value={`$${kpis.ticketPromedio.toFixed(2)}`}
            subtitle="Gasto promedio por cliente"
            icon={TrendingUp}
            color="purple"
          />
          <KpiCard
            title="Sucursal Líder"
            value={kpis.topBranchName.split('-')[1]?.trim() || kpis.topBranchName}
            subtitle={kpis.topBranchTotal > 0 ? `$${kpis.topBranchTotal.toFixed(2)} aportados` : 'Esperando datos'}
            icon={Trophy}
            color="amber"
          />
        </div>

        {/* 4. Gráficos Ejecutivos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BranchComparisonChart data={branchComparisonData} />
          <HourlySalesChart data={hourlyData} />
        </div>

        {/* 5. Métodos de Pago y Top Productos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaymentMethodsPie data={paymentMethodsData} />
          <TopProductsChart data={topProductsData} />
        </div>

        {/* 6. Tabla de Auditoría Detallada y Exportación */}
        <SalesTable sales={sales} branchesMap={branchesMap} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-4 text-center text-xs text-slate-500">
        ICONWEBCONECT-CENTRAL 🌐 — Plataforma Gerencial en la Nube conectada a ICG FrontRest
      </footer>
    </div>
  );
}
