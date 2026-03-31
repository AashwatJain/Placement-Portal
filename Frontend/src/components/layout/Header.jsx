import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  Sun,
  Moon,
  Bell,
  Menu,
  CheckCheck,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  User,
  LogOut,
  Trash2,
} from "lucide-react";
import { fetchNotifications, markNotificationsRead, deleteNotificationApi } from "../../services/studentApi";

export default function Header({ toggleSidebar }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const defaultName = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "User";
  const displayName = user?.fullName || user?.name || defaultName;
  const displayInitial = displayName.charAt(0).toUpperCase();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("All");
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await fetchNotifications(user?.uid);
      setNotifications(data.map(n => ({
        id: n.id,
        title: n.text || "Notification",
        message: n.text,
        time: n.createdAt?._seconds
          ? getRelativeTime(n.createdAt._seconds * 1000)
          : "just now",
        type: n.type === "deadline" ? "alert"
          : n.type === "shortlist" ? "success"
            : n.type === "reminder" ? "warning"
              : "info",
        rawType: n.type || "info",
        read: n.read || false
      })));
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const getRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    try {
      await markNotificationsRead();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    try {
      await deleteNotificationApi(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const clearAllNotifications = async () => {
    const ids = notifications.map(n => n.id);
    setNotifications([]);
    for (const id of ids) {
      try {
        await deleteNotificationApi(id);
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "alert": return <AlertCircle size={16} className="text-red-500" />;
      case "success": return <CheckCircle size={16} className="text-emerald-500" />;
      case "warning": return <AlertCircle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-brand-amber-500/100" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case "alert": return "border-l-red-500";
      case "success": return "border-l-emerald-500";
      case "warning": return "border-l-amber-500";
      default: return "border-l-brand-amber-500/100";
    }
  };

  const NOTIF_TABS = [
    { key: "All", label: "All" },
    { key: "deadline", label: "Deadlines" },
    { key: "shortlist", label: "Shortlists" },
    { key: "info", label: "Info" },
  ];

  const filteredNotifications = notifFilter === "All"
    ? notifications
    : notifications.filter(n => n.rawType === notifFilter || (notifFilter === "info" && (n.rawType === "info" || n.rawType === "reminder")));

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-brand-beige-200 bg-brand-cream-50/90 px-4 backdrop-blur dark:border-[#3E2315] dark:bg-[#1A0F08]/90 sm:px-6">

      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-brand-brown-600 hover:text-brand-brown-900 dark:text-brand-beige-400 md:hidden">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3">

        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-brand-brown-600 hover:bg-brand-beige-100 dark:text-brand-beige-400 dark:hover:bg-[#2A1810] transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { const willOpen = !isNotifOpen; setIsNotifOpen(willOpen); setIsProfileOpen(false); if (willOpen) loadNotifications(); }}
            className={`relative rounded-full p-2 transition-colors ${isNotifOpen ? "bg-brand-beige-200 text-brand-brown-900 dark:bg-[#3E2315] dark:text-brand-beige-100" : "text-brand-brown-600 hover:bg-brand-beige-100 dark:text-brand-beige-400 dark:hover:bg-[#2A1810]"}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 animate-in fade-in zoom-in-95 duration-100 origin-top-right rounded-xl border border-brand-beige-200 bg-white shadow-xl dark:border-[#3E2315] dark:bg-[#1A0F08]">
              <div className="flex items-center justify-between border-b border-brand-beige-100 px-4 py-3 dark:border-[#3E2315]">
                <h3 className="font-semibold text-brand-brown-900 dark:text-white flex items-center gap-2">
                  Recent Alerts
                  {notifications.length > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-brand-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-amber-500 dark:bg-[#3E2315]/50 dark:text-brand-amber-500">
                      {notifications.length}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs font-medium text-brand-amber-500 hover:text-brand-amber-600 dark:text-brand-amber-500"
                      title="Mark all as read"
                    >
                      <CheckCheck size={14} /> Read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400"
                      title="Clear all notifications"
                    >
                      <Trash2 size={14} /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex border-b border-brand-beige-100 dark:border-[#3E2315] px-2 py-1.5 gap-1">
                {NOTIF_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setNotifFilter(tab.key)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                      notifFilter === tab.key
                        ? "bg-brand-beige-100 text-brand-brown-900 dark:bg-[#3E2315] dark:text-white"
                        : "text-brand-brown-600 hover:text-brand-brown-900 hover:bg-brand-beige-50 dark:hover:bg-[#2A1810] dark:hover:text-brand-beige-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="max-h-[350px] overflow-y-auto py-1">
                {notifLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-brand-cream-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-amber-500/100 border-t-transparent mb-2"></div>
                    <p className="text-xs">Loading...</p>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`relative flex gap-3 border-b border-l-[3px] border-b-brand-cream-50 px-4 py-3 transition-colors last:border-b-0 hover:bg-brand-cream-50 dark:border-b-brand-brown-800/50 dark:hover:bg-brand-brown-800/50 ${getBorderColor(notif.type)} ${!notif.read ? "bg-brand-amber-500/10/30 dark:bg-brand-amber-800/10" : ""}`}
                    >
                      <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-beige-100 dark:bg-[#2A1810]`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-snug ${!notif.read ? "text-brand-brown-900 dark:text-white" : "text-brand-brown-600 dark:text-brand-beige-300"}`}>
                            {notif.title}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                            className="text-brand-brown-400 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-brand-brown-400">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <div className="absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-brand-amber-500/100"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-brand-cream-500">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-beige-100 dark:bg-[#2A1810]">
                      <Bell size={24} className="text-brand-beige-300 dark:text-brand-brown-600" />
                    </div>
                    <p className="text-sm font-medium text-brand-brown-600 dark:text-brand-beige-300">You're all caught up! 🎉</p>
                    <p className="text-xs text-brand-brown-400 mt-1">No {notifFilter !== "All" ? notifFilter.toLowerCase() : ""} notifications right now.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all overflow-hidden ${isProfileOpen
              ? "bg-brand-brown-900 text-white ring-2 ring-brand-brown-600 dark:ring-[#C07840]"
              : "bg-brand-brown-800 text-brand-beige-100 hover:bg-brand-brown-900"
              }`}
          >
            {(user?.avatarUrl || user?.avatar) ? (
              <img src={user.avatarUrl || user.avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              displayInitial
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 animate-in fade-in zoom-in-95 duration-100 origin-top-right rounded-xl border border-brand-beige-200 bg-white shadow-xl dark:border-[#3E2315] dark:bg-[#1A0F08] p-1.5">

              <div className="px-3 py-2 border-b border-brand-beige-100 dark:border-[#3E2315] mb-1">
                <p className="text-sm font-bold text-brand-brown-900 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-brand-brown-600 dark:text-brand-beige-400 truncate">{user?.email}</p>
              </div>

              <div className="space-y-0.5">
                <Link
                  to={user?.role === "admin" ? "/admin/profile" : user?.role === "recruiter" ? "/recruiter/profile" : "/student/profile"}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-brown-700 hover:bg-brand-beige-50 hover:text-brand-brown-900 dark:text-brand-beige-300 dark:hover:bg-[#2A1810] dark:hover:text-white transition-colors"
                >
                  <User size={16} /> My Profile
                </Link>

              </div>

              <div className="mt-1 border-t border-brand-beige-100 dark:border-[#3E2315] pt-1">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>

            </div>
          )}
        </div>

      </div >
    </header >
  );
}