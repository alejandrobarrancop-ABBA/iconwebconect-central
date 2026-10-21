import React from 'react';
import { LayoutDashboard, Sparkles, ReceiptText, TrendingUp, Users, Settings } from 'lucide-react';

export default function AnalyticsTabs({ activeTab, setActiveTab, userRole }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: LayoutDashboard },
    { id: 'ai-reports', label: 'Reportes con IA', icon: Sparkles, badge: 'NUEVO' },
    { id: 'ventas', label: 'Ventas y Tickets', icon: ReceiptText },
    { id: 'cierres', label: 'Cierres de Caja (Z)', icon: TrendingUp },
    { id: 'usuarios', label: 'Usuarios y Accesos', icon: Users, adminOnly: true },
    { id: 'config', label: 'Configuración y Conectores', icon: Settings, adminOnly: true },
  ];

  const visibleTabs = tabs.filter(t => !t.adminOnly || userRole === 'ADMINISTRADOR');

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-print">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
    </div>
  );
}
