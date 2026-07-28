import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  let colorStyle = 'bg-gray-100 text-gray-700 border-gray-200';

  if (['PAID', 'SUCCESS', 'COMPLETED', 'REALIZED'].includes(normalized)) {
    colorStyle = 'bg-emerald-50 text-[#16A34A] border-emerald-200';
  } else if (['UNPAID', 'OVERDUE', 'FAILED', 'BOUNCED', 'DEFAULTER'].includes(normalized)) {
    colorStyle = 'bg-rose-50 text-[#DC2626] border-rose-200';
  } else if (['PARTIAL', 'PENDING', 'UNDER_REVIEW', 'UNDER_RECONCILIATION'].includes(normalized)) {
    colorStyle = 'bg-amber-50 text-[#D97706] border-amber-200';
  } else if (['WAIVED', 'CANCELLED'].includes(normalized)) {
    colorStyle = 'bg-gray-100 text-gray-600 border-gray-200';
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-extrabold border ${colorStyle} ${className}`}
    >
      {normalized.replace('_', ' ')}
    </span>
  );
};
