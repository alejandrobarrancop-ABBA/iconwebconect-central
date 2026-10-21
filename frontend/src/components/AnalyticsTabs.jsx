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
    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#172d54] no-print">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-gradient-to-r from-[#22c1b4] to-teal-600 text-[#070f1e] shadow-lg shadow-[#22c1b4]/20 font-black'
                : 'bg-[#0b172d] text-slate-300 hover:text-white hover:bg-[#102142] border border-[#172d54]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#070f1e]' : 'text-[#22c1b4]'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-[#070f1e] text-[#22c1b4]' : 'bg-[#22c1b4]/20 text-[#22c1b4]'
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
