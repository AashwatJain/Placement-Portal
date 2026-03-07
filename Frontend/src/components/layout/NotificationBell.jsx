import { useState } from "react";

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Microsoft OA deadline: Feb 20", type: "deadline" },
  { id: 2, text: "Shortlisted for Google interview", type: "shortlist" },
  { id: 3, text: "Amazon drive on Feb 25", type: "reminder" },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-600 dark:bg-slate-800">
            <div className="border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">Notifications</div>
            <ul className="max-h-64 overflow-auto">
              {MOCK_NOTIFICATIONS.map((n) => (
                <li key={n.id} className="border-b border-slate-50 px-4 py-2 text-sm text-slate-700 last:border-0 dark:border-slate-700 dark:text-slate-300">
                  {n.text}
                  <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">({n.type})</span>
                </li>
              ))}
            </ul>
            <div className="px-4 py-2 text-center text-xs text-slate-500 dark:text-slate-400">Deadline rem. & shortlist (mock)</div>
          </div>
        </>
      )}
    </div>
  );
}
