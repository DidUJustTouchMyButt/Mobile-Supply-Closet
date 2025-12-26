import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'rose';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color = 'emerald' }) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded- ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <p className="mt-2 text-xs text-gray-500">
          {trend}
        </p>
      )}
    </div>
  );
};
