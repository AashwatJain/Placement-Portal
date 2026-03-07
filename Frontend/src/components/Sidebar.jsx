import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  User, 
  Building2, 
  FileQuestion, 
  CalendarDays, 
  Users, 
  Code,
  LogOut,
  FileText,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FileUser,
  Briefcase // <-- Imported Briefcase icon
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Default collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);

  const roleNav = {
    student: [
      { to: "/student", label: "Dashboard", icon: LayoutDashboard },
      { to: "/student/profile", label: "My Profile", icon: User },
      { to: "/student/coding-profiles", label: "Coding Stats", icon: Code },
      { to: "/student/resume-builder", label: "Resume Vault", icon: FileUser },
      { to: "/student/applications", label: "My Applications", icon: FileText },
      { to: "/student/company", label: "Companies", icon: Building2 },
      { to: "/student/opportunities", label: "Opportunities", icon: Briefcase },
      { to: "/student/interview-experiences", label: "Interview Exp.", icon: FileQuestion }, 
      { to: "/calendar", label: "Calendar", icon: CalendarDays },
    ],
    admin: [
      { to: "/admin/students", label: "Student Management", icon: Users },
      // 👇 Updated Label and Icon here
      { to: "/admin/company-add", label: "Manage Companies", icon: Briefcase }, 
      { to: "/admin/questions", label: "Question Bank", icon: FileQuestion },
      { to: "/calendar", label: "Calendar", icon: CalendarDays },
    ],
    recruiter: [
      { to: "/recruiter", label: "Dashboard", icon: LayoutDashboard },
      { to: "/calendar", label: "Calendar", icon: CalendarDays },
    ],
  };

  const navLinks = roleNav[user?.role] || [];

  const isActive = (path) => {
    if (path === "/student" && location.pathname === "/student") return true;
    if (path !== "/student" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside 
      className={`hidden flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 md:flex ${
        isCollapsed ? "w-16" : "w-56"
      }`}
    >
      {/* 1. Header & Toggle Button */}
      <div className={`flex h-14 items-center border-b border-slate-200 px-3 dark:border-slate-800 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Compact Logo */}
          <div className="flex h-8 w-8 min-w-[2rem] items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <GraduationCap size={18} />
          </div>

          {/* Text Details */}
          {!isCollapsed && (
            <div className="flex flex-col transition-opacity duration-300">
              <span className="whitespace-nowrap text-sm font-bold leading-none text-slate-900 dark:text-white">
                NIT KKR
              </span>
              <span className="mt-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Placement
              </span>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Re-open button when collapsed */}
      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-slate-200 dark:border-slate-800">
           <button 
            onClick={() => setIsCollapsed(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 2. Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <nav className="space-y-1 px-2">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              title={isCollapsed ? label : ""}
              className={`flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors ${
                isActive(to)
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <Icon size={20} className="shrink-0" />
              
              {!isCollapsed && (
                <span className="whitespace-nowrap text-sm font-medium transition-opacity duration-300">
                  {label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* 3. Bottom Actions */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          onClick={logout}
          title={isCollapsed ? "Sign Out" : ""}
          className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}