import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

interface KPICardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  deltaText: string;
  isPositive?: boolean;
  onMoreClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  isCurrency = true,
  deltaText,
  isPositive = true,
  onMoreClick,
}) => {
  const formattedValue = isCurrency ? formatCurrency(value) : value.toLocaleString('en-IN');

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl p-5 border border-[#E5E7EB] card-shadow flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
          {title}
        </span>
        {onMoreClick && (
          <button onClick={onMoreClick} className="text-[#6B7280] hover:text-[#1A1A1A]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3">
        <div className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          {formattedValue}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-[#6B7280] font-medium">Monthly Delta</span>
          <span
            className={`inline-flex items-center gap-0.5 font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
              isPositive
                ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                : 'bg-rose-50 text-[#DC2626] border border-rose-200'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {deltaText}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
