import React from 'react';

const StatusBadge = ({ role, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const getColors = () => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return isDark ? 'bg-rose-950/40 text-rose-400 border-rose-900/30' : 'bg-rose-50 text-rose-750 border-rose-200';
      case 'manager':
        return isDark ? 'bg-purple-950/40 text-purple-400 border-purple-900/30' : 'bg-purple-50 text-purple-750 border-purple-200';
      case 'supervisor':
        return isDark ? 'bg-blue-950/40 text-blue-400 border-blue-900/30' : 'bg-blue-50 text-blue-750 border-blue-200';
      case 'senior cashier':
        return isDark ? 'bg-teal-950/40 text-teal-400 border-teal-900/30' : 'bg-teal-50 text-teal-750 border-teal-200';
      default:
        return isDark ? 'bg-slate-800/85 text-slate-300 border-slate-700/50' : 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-extrabold uppercase border tracking-wider ${getColors()}`}>
      {role}
    </span>
  );
};

export default StatusBadge;
