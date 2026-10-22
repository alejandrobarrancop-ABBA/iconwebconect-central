import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  ReceiptText, 
  TrendingUp, 
  Settings, 
  Users, 
  Server, 
  ChevronDown, 
  ShieldCheck, 
  Building2,
  Sliders,
  Key
} from 'lucide-react';

export default function AnalyticsTabs({ activeTab, setActiveTab, userRole, onOpenSaas }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: LayoutDashboard },
    { id: 'ai-reports', label: 'Reportes con IA', icon: Sparkles, badge: 'NUEVO' },
    { id: 'ventas', label: 'Ventas y Tickets', icon: ReceiptText },
    { id: 'cierres', label: 'Cierres de Caja (Z)', icon: TrendingUp },
  ];

  const adminOptions = [
    {
      id: 'config',
      label: 'Configuración del Sistema y Conexiones',
      desc: 'Sucursales, Cajas, SQL Server Express y Conectores .env',
      icon: Server
    },
    {
      id: 'usuarios',
      label: 'Usuarios y Accesos Web',
      desc: 'Perfiles de Administrador, Gerente Ejecutivo, Gerente y Operador',
      icon: Users
    },
    {
      id: 'parametros',
      label: 'Empresas y Parámetros Globales',
      desc: 'Configuraciones fiscales, alertas y módulos del sistema',
      icon: Sliders
    }
  ];

  if (userRole === 'SUPERADMIN' || userRole === 'DISTRIBUIDOR') {
    adminOptions.unshift({
      id: 'saas_hub',
      label: userRole === 'SUPERADMIN' ? 'Consola Global SaaS & Distribuidores' : 'Portal Distribuidor & Licencias',
      desc: 'Emisión de licencias On-Premise, suscripciones anuales y tenants',
      icon: ShieldCheck,
      highlight: true
    });
  }

  const isAdminTabActive = activeTab === 'config' || activeTab === 'usuarios' || activeTab === 'parametros' || activeTab === 'saas_hub';
  const showAdminMenu = userRole === 'ADMINISTRADOR' || userRole === 'SUPERADMIN' || userRole === 'DISTRIBUIDOR';

  const handleSelectAdminOption = (tabId) => {
    if (tabId === 'saas_hub') {
      if (onOpenSaas) onOpenSaas();
    } else if (tabId === 'parametros') {
      setActiveTab('config');
    } else {
      setActiveTab(tabId);
    }
    setDropdownOpen(false);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-visible pb-2 border-b border-slate-200 no-print relative">
      {/* 1. Pestañas Principales Operativas y Gerenciales */}
      {mainTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setDropdownOpen(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-[#22c1b4] text-white shadow-md shadow-teal-500/25 font-black'
                : 'bg-white text-slate-600 hover:text-teal-700 hover:bg-teal-50/60 border border-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-600'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white text-teal-800' : 'bg-teal-100 text-teal-800'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* 2. Menú Desplegable: ADMINISTRACIÓN */}
      {showAdminMenu && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              isAdminTabActive
                ? 'bg-[#22c1b4] text-white shadow-md shadow-teal-500/25 font-black'
                : 'bg-white text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 border border-slate-200'
            }`}
          >
            <Settings className={`w-4 h-4 ${isAdminTabActive ? 'text-white' : 'text-teal-600'}`} />
            <span>Administración</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú Desplegable con Sombra Suave y Fondo Blanco */}
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 font-sans">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Módulos de Control
                </span>
              </div>

              <div className="space-y-1">
                {adminOptions.map((opt) => {
                  const OptIcon = opt.icon;
                  const isSelected = activeTab === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectAdminOption(opt.id)}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                        opt.highlight
                          ? 'bg-purple-50 hover:bg-purple-100 text-purple-950 border border-purple-200 mb-1'
                          : isSelected
                          ? 'bg-teal-50 text-teal-900 border border-teal-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        opt.highlight
                          ? 'bg-purple-200 text-purple-800'
                          : isSelected 
                          ? 'bg-teal-500 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <OptIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-snug">
                          {opt.label}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
