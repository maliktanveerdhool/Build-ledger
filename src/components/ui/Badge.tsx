import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  let colorStyle = 'bg-slate-100 text-slate-800 border-slate-200';

  switch (status) {
    case 'Active':
      colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'Completed':
      colorStyle = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'On Hold':
      colorStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'Paid':
      colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'Sent':
      colorStyle = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'Overdue':
      colorStyle = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'Draft':
      colorStyle = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Active' || status === 'Paid' ? 'bg-emerald-500' :
        status === 'Completed' ? 'bg-blue-500' :
        status === 'Sent' ? 'bg-sky-500' :
        status === 'Overdue' ? 'bg-rose-500' :
        status === 'On Hold' ? 'bg-amber-500' : 'bg-slate-400'
      }`} />
      {status}
    </span>
  );
};
