import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const VARIANTS = {
  success: {
    icon: CheckCircle,
    border: "border-green-200 dark:border-green-800",
    iconColor: "text-green-500",
    bg: "bg-white dark:bg-[#2A1810]",
  },
  error: {
    icon: AlertCircle,
    border: "border-red-200 dark:border-red-800",
    iconColor: "text-red-500",
    bg: "bg-white dark:bg-[#2A1810]",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-500",
    bg: "bg-white dark:bg-[#2A1810]",
  },
  info: {
    icon: Info,
    border: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500",
    bg: "bg-white dark:bg-[#2A1810]",
  },
};

export default function Toast({ type = "success", title = "Success!", message, onClose }) {
  const v = VARIANTS[type] || VARIANTS.success;
  const Icon = v.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl ${v.bg} border ${v.border} shadow-2xl px-5 py-4 min-w-[320px] max-w-[420px] animate-in slide-in-from-bottom-4 duration-300`}
    >
      <Icon className={`${v.iconColor} shrink-0 mt-0.5`} size={20} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-brand-brown-900 dark:text-white text-sm">{title}</p>
        {message && (
          <p className="text-xs text-brand-cream-500 dark:text-brand-beige-400 mt-0.5 break-words">
            {message}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 p-0.5 rounded-md text-brand-brown-400 hover:text-brand-brown-600 dark:hover:text-white hover:bg-brand-beige-100 dark:hover:bg-brand-brown-800 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
