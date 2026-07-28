import React, { useEffect, useState } from 'react';
import { useToastStore, Toast } from '../../store/toastStore';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-white border-[#16A34A]/30 text-[#16A34A]',
  error: 'bg-white border-[#DC2626]/30 text-[#DC2626]',
  info: 'bg-white border-[#3B82F6]/30 text-[#3B82F6]',
  warning: 'bg-white border-[#D97706]/30 text-[#D97706]',
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { remove } = useToastStore();
  const [visible, setVisible] = useState(false);
  const Icon = iconMap[toast.type];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl shadow-black/5 min-w-[280px] max-w-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${colorMap[toast.type]}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-extrabold text-[#1A1A1A]">{toast.title}</p>
        {toast.message && <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="p-0.5 text-[#6B7280] hover:text-[#1A1A1A] shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
