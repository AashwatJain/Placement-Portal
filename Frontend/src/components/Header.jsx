import { useState } from "react";
import { Link } from "react-router-dom"; // Link import kiya
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
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
  User,       // New Icon
  LogOut,     // New Icon
  Settings    // New Icon
} from "lucide-react";

export default function Header({ toggleSidebar }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth(); // Logout function yahan se liya

  // States for Dropdowns
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // New State for Profile

  // --- Notification Data ---
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Google OA Reminder",
      message: "Online Assessment scheduled for tomorrow at 10 AM.",
      time: "2 hours ago",
      type: "alert",
      read: false
    },
    {
      id: 2,
      title: "Resume Shortlisted",
      message: "Microsoft has shortlisted your resume for the Interview round.",
      time: "5 hours ago",
      type: "success",
      read: false
    },
    {
      id: 3,
      title: "Profile Incomplete",
      message: "Please add your Codeforces handle to improve visibility.",
      time: "1 day ago",
      type: "warning",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "alert": return <AlertCircle size={16} className="text-red-500" />;
      case "success": return <CheckCircle size={16} className="text-emerald-500" />;
      case "warning": return <AlertCircle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">

      {/* Mobile Menu & Greeting */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 md:hidden">
          <Menu size={24} />
        </button>
        <h2 className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 sm:block">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h2>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-3">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* --- NOTIFICATION BELL --- */}
        <div className="relative">
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className={`relative rounded-full p-2 transition-colors ${isNotifOpen ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
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
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
              <div className="absolute right-0 top-12 z-20 w-80 sm:w-96 animate-in fade-in zoom-in-95 duration-100 origin-top-right rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                {/* Notif Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Recent Alerts</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <CheckCheck size={14} /> Mark read
                    </button>
                  )}
                </div>
                {/* Notif List */}
                <div className="max-h-[350px] overflow-y-auto py-1">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`relative flex gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${!notif.read ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}`}
                      >
                        <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${!notif.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                              {notif.title}
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-400">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-indigo-500"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                      <Bell size={32} className="mb-2 opacity-20" />
                      <p className="text-sm">No new alerts</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* --- USER PROFILE DROPDOWN --- */}
        <div className="relative">
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all overflow-hidden ${isProfileOpen
              ? "bg-indigo-700 text-white ring-2 ring-indigo-200 dark:ring-indigo-900"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
          >
            {(user?.avatarUrl || user?.avatar) ? (
              <img src={user.avatarUrl || user.avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              "M"
            )}
          </button>

          {isProfileOpen && (
            <>
              {/* Backdrop to close */}
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>

              <div className="absolute right-0 top-12 z-20 w-56 animate-in fade-in zoom-in-95 duration-100 origin-top-right rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 p-1.5">

                {/* User Info */}
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="space-y-0.5">
                  <Link
                    to="/student/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                  >
                    <User size={16} /> My Profile
                  </Link>

                  {/* Optional: Settings Link */}
                  {/* <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors">
                     <Settings size={16} /> Settings
                   </button> */}
                </div>

                {/* Logout */}
                <div className="mt-1 border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}