import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

interface KPICardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  deltaPercent: number;
  onMoreClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  isCurrency = true,
  deltaPercent,
  onMoreClick,
}) => {
  const formattedValue = isCurrency ? formatCurrency(value) : value.toLocaleString('en-IN');
  const isPositive = deltaPercent >= 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-shadow flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">
          {title}
        </span>
        {onMoreClick && (
          <button onClick={onMoreClick} className="text-[#6B7280] hover:text-[#1A1A1A]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3">
        <div className="text-[2.25rem] font-extrabold text-[#1A1A1A] tracking-tight leading-none">
          {formattedValue}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[#6B7280] font-medium text-[11px]">vs last month</span>
          <span
            className={`inline-flex items-center gap-0.5 font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
              isPositive
                ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                : 'bg-rose-50 text-[#DC2626] border border-rose-200'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {isPositive ? `+${deltaPercent.toFixed(1)}%` : `${deltaPercent.toFixed(1)}%`}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
