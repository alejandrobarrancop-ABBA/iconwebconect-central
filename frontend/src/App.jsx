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
import AIReportBuilder from './components/AIReportBuilder';
import UsersManagementView from './components/UsersManagementView';
import SaasAdminDashboard from './components/saas/SaasAdminDashboard';
import { DollarSign, Receipt, TrendingUp, Trophy, ArrowLeft, ShieldCheck, Building2 } from 'lucide-react';

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

  // 2. Modo Multi-Tenant & SaaS Console
  const isSuperOrDist = currentUser?.rol === 'SUPERADMIN' || currentUser?.rol === 'DISTRIBUIDOR';
  const [isSaasView, setIsSaasView] = useState(() => {
    return isSuperOrDist;
  });

  const [activeTenantId, setActiveTenantId] = useState(currentUser?.empresa_id || 'goyurt');
  const [activeTenantName, setActiveTenantName] = useState(currentUser?.empresa || 'GOYURT PANAMÁ');

  // Si cambia el usuario, sincronizar modo SaaS
  useEffect(() => {
    if (currentUser?.rol === 'SUPERADMIN' || currentUser?.rol === 'DISTRIBUIDOR') {
      setIsSaasView(true);
    } else {
      setIsSaasView(false);
    }
    if (currentUser?.empresa_id) {
      setActiveTenantId(currentUser.empresa_id);
    }
    if (currentUser?.empresa) {
      setActiveTenantName(currentUser.empresa);
    }
  }, [currentUser]);

  // 3. Estado de Navegación y Filtros (Restricción por Rol)
  const canViewAllBranches = currentUser?.rol === 'ADMINISTRADOR' || currentUser?.rol === 'GERENTE EJECUTIVO' || currentUser?.rol === 'SUPERADMIN' || currentUser?.rol === 'DISTRIBUIDOR';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBranch, setSelectedBranch] = useState(() => {
    try {
      const saved = localStorage.getItem('iconweb_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.rol !== 'ADMINISTRADOR' && u.rol !== 'GERENTE EJECUTIVO' && u.rol !== 'SUPERADMIN' && u.rol !== 'DISTRIBUIDOR' && u.sucursal && u.sucursal !== 'ALL') {
          return u.sucursal;
        }
      }
    } catch (_) {}
    return 'ALL';
  });
  const [dateRange, setDateRange] = useState('TODAY');

  // 4. Estado de Datos Operativos del Tenant Activo
  const [branches, setBranches] = useState([]);
  const [heartbeats, setHeartbeats] = useState({});
  const [sales, setSales] = useState([]);
  const [details, setDetails] = useState([]);
  const [payments, setPayments] = useState([]);
  const [cierres, setCierres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Asegurar restricción de sucursal si el usuario no es Administrador ni Gerente Ejecutivo
  useEffect(() => {
    if (currentUser && !canViewAllBranches && currentUser.sucursal && currentUser.sucursal !== 'ALL') {
      setSelectedBranch(currentUser.sucursal);
    }
  }, [currentUser, canViewAllBranches]);

  const handleLogout = () => {
    localStorage.removeItem('iconweb_user');
    setCurrentUser(null);
  };

  // Conmutador de Tenant para SuperAdmin / Distribuidor
  const handleSwitchTenant = (tenantId, tenantName) => {
    setActiveTenantId(tenantId);
    setActiveTenantName(tenantName);
    setIsSaasView(false);
    setActiveTab('dashboard');
  };

  // Cargar Sucursales y Estado de Conexión del Tenant Activo
  const loadInitialData = async () => {
    try {
      let q = supabase
        .from('sucursales')
        .select('*')
        .order('codigo', { ascending: true });

      if (activeTenantId) {
        q = q.eq('empresa_id', activeTenantId);
      }

      const { data: branchData } = await q;

      if (branchData && branchData.length > 0) {
        setBranches(branchData);
      } else {
        setBranches([
          { id: `${activeTenantId}-suc-01`, nombre: `${activeTenantName} - Sucursal 1 (Local A)`, codigo: '01' },
          { id: `${activeTenantId}-suc-02`, nombre: `${activeTenantName} - Sucursal 2 (Local B)`, codigo: '02' }
        ]);
      }

      // Cargar Heartbeats
      let hbQuery = supabase.from('sucursales_heartbeat').select('*');
      if (activeTenantId) {
        hbQuery = hbQuery.eq('empresa_id', activeTenantId);
      }
      const { data: hbData } = await hbQuery;
      if (hbData) {
        const hbMap = {};
        hbData.forEach(h => { hbMap[h.sucursal_id] = h; });
        setHeartbeats(hbMap);
      }
    } catch (err) {
      console.error('Error cargando sucursales:', err);
    }
  };

  // Cargar Ventas según filtros y permisos con AISLAMIENTO ESTRICTO DE TENANT
  const fetchSalesData = async () => {
    setLoading(true);
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

      // Determinación estricta de sucursal a consultar
      let branchToQuery = selectedBranch;
      if (currentUser && !canViewAllBranches && currentUser.sucursal && currentUser.sucursal !== 'ALL') {
        branchToQuery = currentUser.sucursal;
      }

      // Query Ventas Cabecera con filtro de empresa_id
      let q = supabase
        .from('ventas_cabecera')
        .select('*')
        .eq('empresa_id', activeTenantId)
        .gte('fecha', fromDate.toISOString().split('T')[0])
        .order('fecha_hora', { ascending: false });

      if (branchToQuery !== 'ALL') {
        q = q.eq('sucursal_id', branchToQuery);
      }

      const { data: salesData, error: salesErr } = await q;

      if (salesErr) {
        console.warn('Ventas en nube no disponibles, cargando muestra local para:', activeTenantId);
        loadMockData();
        return;
      }

      if (salesData && salesData.length > 0) {
        setSales(salesData);

        // Cargar detalles de estas ventas
        const saleIds = salesData.map(s => s.id);
        const { data: detailsData } = await supabase
          .from('ventas_detalle')
          .select('*')
          .in('venta_id', saleIds.slice(0, 200));

        setDetails(detailsData || []);

        // Cargar pagos
        const { data: paymentsData } = await supabase
          .from('ventas_pagos')
          .select('*')
          .in('venta_id', saleIds.slice(0, 200));

        setPayments(paymentsData || []);
      } else {
        loadMockData();
      }

      // Cargar Cierres Z
      let cierresQuery = supabase
        .from('cierres_caja')
        .select('*')
        .eq('empresa_id', activeTenantId)
        .order('fecha', { ascending: false })
        .limit(30);

      const { data: cierresData } = await cierresQuery;
      setCierres(cierresData || []);

    } catch (err) {
      console.error('Error cargando ventas:', err);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Datos mock para demo gerencial inmediata si la base no tiene datos
  const loadMockData = () => {
    const mockBranches = branches.length > 0 ? branches : [
      { id: `${activeTenantId}-suc-01`, nombre: `${activeTenantName} - Sucursal 1 (Local A)`, codigo: '01' },
      { id: `${activeTenantId}-suc-02`, nombre: `${activeTenantName} - Sucursal 2 (Local B)`, codigo: '02' }
    ];

    const mockSales = [];
    const mockDetails = [];
    const mockPayments = [];
    const sampleProducts = [
      { cod: 'ART-001', desc: 'Yogurt Griego Fresa 8oz', precio: 3.50, sec: 'YOGURT' },
      { cod: 'ART-002', desc: 'Topping Granola Artesanal', precio: 0.75, sec: 'TOPPINGS' },
      { cod: 'ART-003', desc: 'Smoothie Maracuyá Silvestre', precio: 4.25, sec: 'BEBIDAS' },
      { cod: 'ART-004', desc: 'Parfait Frutos Rojos Deluxe', precio: 5.50, sec: 'POSTRES' },
      { cod: 'ART-005', desc: 'Yogurt Natural Sin Azúcar 16oz', precio: 4.00, sec: 'YOGURT' },
      { cod: 'ART-006', desc: 'Topping Nutella & Avellanas', precio: 1.00, sec: 'TOPPINGS' },
      { cod: 'ART-007', desc: 'Waffle Belga con Helado Yogurt', precio: 6.25, sec: 'POSTRES' },
      { cod: 'ART-008', desc: 'Agua Purificada 500ml', precio: 1.50, sec: 'BEBIDAS' }
    ];

    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 1; i <= 40; i++) {
      const branch = mockBranches[i % mockBranches.length];
      const hour = 10 + (i % 12);
      const saleId = `mock-sale-${activeTenantId}-${i}`;
      const prod = sampleProducts[i % sampleProducts.length];
      const units = (i % 3) + 1;
      const total = Number((prod.precio * units).toFixed(2));

      mockSales.push({
        id: saleId,
        empresa_id: activeTenantId,
        sucursal_id: branch.id,
        caja_id: `${branch.id}-caja-01`,
        serie: 'T1',
        numero: 1000 + i,
        fecha_hora: `${todayStr}T${hour < 10 ? '0' : ''}${hour}:15:00Z`,
        fecha: todayStr,
        hora: hour,
        total_neto: Number((total / 1.07).toFixed(2)),
        total_iva: Number((total - total / 1.07).toFixed(2)),
        total: total,
        salonero: 'CARLOS M.',
        tipo_documento: 'TICKET'
      });

      mockDetails.push({
        id: `mock-det-${saleId}-1`,
        venta_id: saleId,
        numlinea: 1,
        codarticulo: prod.cod,
        descripcion: prod.desc,
        unidades: units,
        precio: prod.precio,
        total_linea: total,
        codseccion: prod.sec
      });

      mockPayments.push({
        id: `mock-pay-${saleId}-1`,
        venta_id: saleId,
        tipo_pago: i % 3 === 0 ? 'YAPPY' : i % 2 === 0 ? 'TARJETA' : 'EFECTIVO',
        importe: total
      });
    }

    setSales(mockSales);
    setDetails(mockDetails);
    setPayments(mockPayments);
    setCierres([
      {
        id: 'mock-z-1',
        empresa_id: activeTenantId,
        sucursal_id: mockBranches[0]?.id,
        numcierre: 142,
        fecha: todayStr,
        total_ventas: 685.50,
        total_efectivo: 210.00,
        total_tarjeta: 350.50,
        total_otros: 125.00
      }
    ]);
  };

  useEffect(() => {
    if (currentUser) {
      loadInitialData();
      fetchSalesData();
    }
  }, [currentUser, activeTenantId, selectedBranch, dateRange]);

  // Si no está autenticado, renderizar Login
  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // Mapa de nombres de sucursales
  const branchesMap = {};
  branches.forEach(b => {
    branchesMap[b.id] = b.nombre;
  });

  // KPIs Calculados
  const kpis = {
    totalVentas: sales.reduce((acc, s) => acc + Number(s.total || 0), 0),
    totalNeto: sales.reduce((acc, s) => acc + Number(s.total_neto || 0), 0),
    totalTickets: sales.length,
    ticketPromedio: sales.length > 0 ? (sales.reduce((acc, s) => acc + Number(s.total || 0), 0) / sales.length) : 0,
    topBranchName: 'Cargando...',
    topBranchTotal: 0
  };

  // Comparativa por Sucursal
  const branchTotals = {};
  sales.forEach(s => {
    const bId = s.sucursal_id;
    branchTotals[bId] = (branchTotals[bId] || 0) + Number(s.total || 0);
  });

  let maxBranchId = null;
  let maxBranchVal = -1;
  Object.keys(branchTotals).forEach(bId => {
    if (branchTotals[bId] > maxBranchVal) {
      maxBranchVal = branchTotals[bId];
      maxBranchId = bId;
    }
  });

  if (maxBranchId && branchesMap[maxBranchId]) {
    kpis.topBranchName = branchesMap[maxBranchId];
    kpis.topBranchTotal = maxBranchVal;
  } else if (branches.length > 0) {
    kpis.topBranchName = branches[0].nombre;
  }

  const branchComparisonData = branches.map(b => ({
    sucursal: b.nombre.replace(/^(GOYURT\s*-\s*)/i, '').replace(/^(MEZE\s*-\s*)/i, ''),
    total: branchTotals[b.id] || 0,
    codigo: b.codigo
  }));

  // Ventas por Hora
  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const salesInHour = sales.filter(s => s.hora === h);
    return {
      hora: `${h}:00`,
      total: salesInHour.reduce((acc, s) => acc + Number(s.total || 0), 0),
      tickets: salesInHour.length
    };
  }).filter(h => h.hora.includes(':00'));

  // Métodos de Pago
  const paymentTotals = {};
  payments.forEach(p => {
    const tipo = (p.tipo_pago || 'OTROS').toUpperCase();
    paymentTotals[tipo] = (paymentTotals[tipo] || 0) + Number(p.importe || 0);
  });

  const paymentMethodsData = Object.keys(paymentTotals).map(k => ({
    name: k,
    value: paymentTotals[k]
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Barra de Navegación Ergonomica */}
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
        isSaasView={isSaasView}
        onToggleSaasView={() => setIsSaasView(prev => !prev)}
        activeTenantName={activeTenantName}
      />

      {/* Banner de Modo Vista de Cliente para SuperAdmin / Distribuidor */}
      {isSuperOrDist && !isSaasView && (
        <div className="bg-gradient-to-r from-purple-50 via-teal-50 to-emerald-50 border-b border-purple-200 px-4 py-2 text-xs font-bold text-slate-700 flex items-center justify-between no-print max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>Viendo portal operativo de: <strong className="text-purple-900">{activeTenantName}</strong> ({activeTenantId})</span>
          </div>
          <button
            onClick={() => setIsSaasView(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-lg text-xs font-black shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Consola SaaS</span>
          </button>
        </div>
      )}

      {/* Contenedor Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* ============================================================== */}
        {/* CASO A: CONSOLA SAAS SUPERADMIN / DISTRIBUIDOR                 */}
        {/* ============================================================== */}
        {isSaasView ? (
          <SaasAdminDashboard
            currentUser={currentUser}
            onSwitchTenant={handleSwitchTenant}
            activeTenantId={activeTenantId}
            isDistributorMode={currentUser?.rol === 'DISTRIBUIDOR'}
          />
        ) : (
          /* ============================================================== */
          /* CASO B: PORTAL OPERATIVO MULTI-TENANT DEL CLIENTE FINAL        */
          /* ============================================================== */
          <>
            {/* Pestañas de Navegación por Módulos */}
            <AnalyticsTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              userRole={currentUser.rol}
              onOpenSaas={() => setIsSaasView(true)}
            />

            {/* Banner de Estado de Puntos de Venta */}
            <div className="no-print">
              <BranchStatusPill branches={branches} heartbeats={heartbeats} />
            </div>

            {/* VISTA 1: DASHBOARD EJECUTIVO Y GERENCIAL */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Tarjetas KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard
                    title="Ventas Totales"
                    value={`$${kpis.totalVentas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle={`Neto sin IVA: $${kpis.totalNeto.toFixed(2)}`}
                    icon={DollarSign}
                    color="emerald"
                    trend="up"
                    trendValue="+12.4%"
                  />
                  <KpiCard
                    title="Tickets Emitidos"
                    value={kpis.totalTickets.toLocaleString('en-US')}
                    subtitle="Transacciones completadas"
                    icon={Receipt}
                    color="blue"
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

                {/* TOP RANKING DE ARTÍCULOS MEJORADO (Cruzado por sucursal, Top N, Barras/Pastel/Líneas) */}
                <div className="w-full">
                  <TopProductsChart
                    details={details}
                    sales={sales}
                    branches={branches}
                    branchesMap={branchesMap}
                    selectedBranch={selectedBranch}
                  />
                </div>

                {/* Gráficos Ejecutivos Complementarios */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BranchComparisonChart data={branchComparisonData} />
                  <HourlySalesChart data={hourlyData} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PaymentMethodsPie data={paymentMethodsData} />
                </div>
              </div>
            )}

            {/* VISTA 2: CREADOR DE REPORTES CON IA */}
            {activeTab === 'ai-reports' && (
              <AIReportBuilder
                sales={sales}
                details={details}
                cierres={cierres}
                branches={branches}
                branchesMap={branchesMap}
              />
            )}

            {/* VISTA 3: VENTAS & AUDITORÍA */}
            {activeTab === 'ventas' && (
              <SalesTable sales={sales} branchesMap={branchesMap} />
            )}

            {/* VISTA 4: CIERRES DE CAJA (CORTES Z) */}
            {activeTab === 'cierres' && (
              <CierresView cierres={cierres} branchesMap={branchesMap} />
            )}

            {/* VISTA 5: GESTIÓN DE USUARIOS */}
            {activeTab === 'usuarios' && (
              <UsersManagementView branches={branches} />
            )}

            {/* VISTA 6: CONFIGURACIÓN Y CONECTORES */}
            {activeTab === 'config' && (
              <ConfigView
                branches={branches}
                heartbeats={heartbeats}
                onBranchesUpdated={setBranches}
              />
            )}
          </>
        )}
      </main>

      {/* Footer Oficial Corporativo */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 no-print space-y-1">
        <div className="font-bold tracking-tight text-slate-700">
          DESARROLLADO POR GRUPO VEV, S.A. — DISTRIBUIDO POR ABBA INNOVATION S.A. PANAMÁ
        </div>
        <div className="text-[11px] font-black text-teal-700 uppercase tracking-wider">
          ICONWEBCONECT CENTRAL 2026 V.1.0 • Plataforma Multi-Tenant en la Nube conectada a ICG FrontRest
        </div>
      </footer>
    </div>
  );
}
