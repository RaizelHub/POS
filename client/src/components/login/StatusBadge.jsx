import React from 'react';

const StatusBadge = ({ role, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const getColors = () => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-900 text-white border-slate-900';
      case 'manager':
        return isDark ? 'bg-slate-850 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300';
      case 'supervisor':
        return isDark ? 'bg-slate-850 text-slate-300 border-slate-750' : 'bg-slate-100 text-slate-700 border-slate-200';
      case 'senior cashier':
        return isDark ? 'bg-slate-850 text-slate-300 border-slate-750' : 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-mono font-semibold uppercase border tracking-wider ${getColors()}`}>
      {role}
    </span>
  );
};

export default StatusBadge;
