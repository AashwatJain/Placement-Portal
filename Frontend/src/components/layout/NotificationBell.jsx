import { useState, useEffect } from "react";
import { fetchNotifications } from "../../services/studentApi";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications when dropdown opens
  const handleToggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      setLoading(true);
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Type → style mapping
  const typeStyles = {
    deadline: "text-red-500 dark:text-red-400",
    shortlist: "text-green-500 dark:text-green-400",
    reminder: "text-amber-500 dark:text-amber-400",
    info: "text-blue-500 dark:text-blue-400",
  };

  const typeLabels = {
    deadline: "⏰",
    shortlist: "✅",
    reminder: "🔔",
    info: "ℹ️",
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-600 dark:bg-slate-800">
            <div className="border-b border-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">
              Notifications
            </div>
            <ul className="max-h-72 overflow-auto">
              {loading && (
                <li className="px-4 py-6 text-center text-sm text-slate-400">Loading...</li>
              )}
              {!loading && notifications.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                  No notifications yet 🎉
                </li>
              )}
              {!loading && notifications.map((n) => (
                <li key={n.id} className="border-b border-slate-50 px-4 py-2.5 text-sm text-slate-700 last:border-0 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50 transition-colors">
                  <span className="mr-1.5">{typeLabels[n.type] || "📌"}</span>
                  {n.text}
                  <span className={`ml-1.5 text-xs font-medium ${typeStyles[n.type] || "text-slate-400"}`}>
                    {n.type}
                  </span>
                </li>
              ))}
            </ul>
            {!loading && notifications.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-2 text-center text-xs text-slate-400 dark:text-slate-500">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
