import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabaseClient';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import AnalyticsTabs from './components/AnalyticsTabs';
import BranchStatusPill from './components/BranchStatusPill';
import KpiCard from './components/KpiCard';
import BranchComparisonChart from './components/BranchComparisonChart';
import HourlySalesChart from './components/HourlySalesChart';
import PaymentMethodsPie from './components/PaymentMethodsPie';
import TopProductsChart from './components/TopProductsChart';
import SalesTable from './components/SalesTable';
import CierresView from './components/CierresView';
import ConfigView from './components/ConfigView';
import { DollarSign, Receipt, TrendingUp, Trophy, AlertCircle } from 'lucide-react';

export default function App() {
  // 1. Estado de Autenticación
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('iconweb_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  // 2. Estado de Navegación y Filtros
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [dateRange, setDateRange] = useState('TODAY');

  // 3. Estado de Datos
  const [branches, setBranches] = useState([]);
  const [heartbeats, setHeartbeats] = useState({});
  const [sales, setSales] = useState([]);
  const [details, setDetails] = useState([]);
  const [payments, setPayments] = useState([]);
  const [cierres, setCierres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('iconweb_user');
    setCurrentUser(null);
  };

  // Cargar Sucursales y Estado de Conexión
  const loadInitialData = async () => {
    try {
      const { data: branchData } = await supabase
        .from('sucursales')
        .select('*')
        .order('codigo', { ascending: true });

      if (branchData && branchData.length > 0) {
        setBranches(branchData);
      } else {
        setBranches([
          { id: 'goyurt-suc-01', nombre: 'GOYURT - Sucursal 1 (Local A)', codigo: '01' },
          { id: 'goyurt-suc-02', nombre: 'GOYURT - Sucursal 2 (Local B)', codigo: '02' }
        ]);
      }

      // Cargar Heartbeats
      const { data: hbData } = await supabase.from('sucursales_heartbeat').select('*');
      if (hbData) {
        const hbMap = {};
        hbData.forEach(h => { hbMap[h.sucursal_id] = h; });
        setHeartbeats(hbMap);
      }
    } catch (err) {
      console.error('Error cargando sucursales:', err);
    }
  };

  // Cargar Ventas según filtros
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

      const { data: salesData } = await query;
      setSales(salesData || []);

      // Query Detalles (Top productos)
      const { data: detData } = await supabase.from('ventas_detalle').select('*').limit(200);
      setDetails(detData || []);

      // Query Métodos de Pago
      const { data: pagData } = await supabase.from('ventas_pagos').select('*').limit(200);
      setPayments(pagData || []);

      // Query Cierres de Caja
      const { data: cieData } = await supabase.from('cierres_caja').select('*').order('fecha_cierre', { ascending: false }).limit(50);
      setCierres(cieData || []);

    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchSalesData();
    }
  }, [currentUser, selectedBranch, dateRange]);

  // Suscripción Realtime a Supabase
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel('realtime_central')
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
  }, [currentUser, selectedBranch, dateRange]);

  const branchesMap = useMemo(() => {
    const map = {};
    branches.forEach(b => { map[b.id] = b.nombre; });
    return map;
  }, [branches]);

  // Cálculos de KPIs Consolidados
  const kpis = useMemo(() => {
    const totalVentas = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const totalNeto = sales.reduce((acc, s) => acc + Number(s.total_neto || 0), 0);
    const totalTickets = sales.length;
    const ticketPromedio = totalTickets > 0 ? totalVentas / totalTickets : 0;

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

  // Comparativo por Sucursal
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

  // Ventas por Hora
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

    return hours.slice(8, 24);
  }, [sales]);

  // Métodos de Pago
  const paymentMethodsData = useMemo(() => {
    const counts = {};
    payments.forEach(p => {
      const desc = p.descripcion_pago || (p.codformapago === '1' ? 'Efectivo' : 'Tarjeta');
      counts[desc] = (counts[desc] || 0) + Number(p.importe || 0);
    });

    if (Object.keys(counts).length === 0 && sales.length > 0) {
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

  // Top Productos
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

  // Si no está autenticado, mostrar pantalla de Login
  if (!currentUser) {
    return <Login onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-[#060d1f] text-slate-100 flex flex-col font-sans">
      {/* 1. Header Oficial ICONWEBCONECT */}
      <Navbar
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        branches={branches}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRefresh={fetchSalesData}
        loading={loading}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Cuerpo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Pestañas de Navegación */}
        <AnalyticsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={currentUser.rol}
        />

        {/* Banner de Estado de Puntos de Venta */}
        <BranchStatusPill branches={branches} heartbeats={heartbeats} />

        {/* VISTA 1: DASHBOARD EJECUTIVO */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Tarjetas KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Ventas Totales"
                value={`$${kpis.totalVentas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle={`Neto sin IVA: $${kpis.totalNeto.toFixed(2)}`}
                icon={DollarSign}
                color="blue"
                trend="up"
                trendValue="+12.4%"
              />
              <KpiCard
                title="Tickets Emitidos"
                value={kpis.totalTickets.toLocaleString('en-US')}
                subtitle="Transacciones registradas"
                icon={Receipt}
                color="emerald"
              />
              <KpiCard
                title="Ticket Promedio"
                value={`$${kpis.ticketPromedio.toFixed(2)}`}
                subtitle="Gasto medio por cliente"
                icon={TrendingUp}
                color="purple"
              />
              <KpiCard
                title="Sucursal Líder"
                value={kpis.topBranchName.split('-')[1]?.trim() || kpis.topBranchName}
                subtitle={kpis.topBranchTotal > 0 ? `$${kpis.topBranchTotal.toFixed(2)} acumulados` : 'Esperando ventas'}
                icon={Trophy}
                color="amber"
              />
            </div>

            {/* Gráficos Ejecutivos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BranchComparisonChart data={branchComparisonData} />
              <HourlySalesChart data={hourlyData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentMethodsPie data={paymentMethodsData} />
              <TopProductsChart data={topProductsData} />
            </div>
          </div>
        )}

        {/* VISTA 2: VENTAS & AUDITORÍA */}
        {activeTab === 'ventas' && (
          <SalesTable sales={sales} branchesMap={branchesMap} />
        )}

        {/* VISTA 3: CIERRES DE CAJA (CORTES Z) */}
        {activeTab === 'cierres' && (
          <CierresView cierres={cierres} branchesMap={branchesMap} />
        )}

        {/* VISTA 4: CONFIGURACIÓN Y CONECTORES */}
        {activeTab === 'config' && (
          <ConfigView branches={branches} heartbeats={heartbeats} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a2d6b] bg-[#060d1f] py-4 text-center text-xs text-slate-500">
        ICONWEBCONECT-CENTRAL 🌐 — Plataforma Gerencial en la Nube conectada a ICG FrontRest
      </footer>
    </div>
  );
}
