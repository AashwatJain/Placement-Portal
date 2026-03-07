import { CheckCircle } from "lucide-react";

/**
 * Reusable success toast notification.
 *
 * Props:
 *   title   – Bold heading text (e.g. "Registered!")
 *   message – Descriptive line below the title
 *   onClose – Callback to dismiss the toast
 */
export default function Toast({ title = "Success!", message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800 shadow-2xl px-5 py-4 animate-in slide-in-from-bottom-4 duration-300">
      <CheckCircle className="text-green-500 shrink-0" size={22} />
      <div>
        <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">✕</button>
    </div>
  );
}
