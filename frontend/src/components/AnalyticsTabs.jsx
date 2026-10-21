import React from 'react';
import { LayoutDashboard, ReceiptText, ShieldAlert, Settings, TrendingUp } from 'lucide-react';

export default function AnalyticsTabs({ activeTab, setActiveTab, userRole }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: LayoutDashboard },
    { id: 'ventas', label: 'Ventas y Tickets', icon: ReceiptText },
    { id: 'cierres', label: 'Cierres de Caja (Z)', icon: TrendingUp },
    { id: 'config', label: 'Configuración y Conectores', icon: Settings, adminOnly: true },
  ];

  const visibleTabs = tabs.filter(t => !t.adminOnly || userRole === 'ADMINISTRADOR');

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#1a2d6b]">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-400/40'
                : 'bg-[#0b1530] text-slate-400 hover:text-slate-200 hover:bg-[#111f4a] border border-[#1a2d6b]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
