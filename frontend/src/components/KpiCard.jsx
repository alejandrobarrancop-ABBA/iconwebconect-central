import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.emerald}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-2">
          {trendValue && (
            <span
              className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                trend === 'up'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {trendValue}
            </span>
          )}
          {subtitle && <span className="text-xs text-slate-500 font-medium">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
