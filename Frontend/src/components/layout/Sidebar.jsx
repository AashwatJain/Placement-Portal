import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  Briefcase,
  BookOpen,
  Star,
  Search,
  Megaphone,
  MessageSquare,
  Brain
} from "lucide-react";

const roleNav = {
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/opportunities", label: "Opportunities", icon: Briefcase },
    { to: "/student/company", label: "Companies", icon: Building2 },
    { to: "/student/applications", label: "My Applications", icon: FileText },
    { to: "/student/placement-insights", label: "Placement Insights", icon: Brain },
    { to: "/student/coding-profiles", label: "Coding Stats", icon: Code },
    { to: "/student/resume-builder", label: "Resume Vault", icon: FileUser },
    { to: "/student/practice", label: "Practice", icon: BookOpen },
    { to: "/student/interview-experiences", label: "Interview Exp.", icon: FileQuestion },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/student/profile", label: "My Profile", icon: User },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/students", label: "Student Management", icon: Users },
    { to: "/admin/company-add", label: "Manage Companies", icon: Briefcase },
    { to: "/admin/questions", label: "Question Bank", icon: FileQuestion },
    { to: "/admin/notifications", label: "Notifications", icon: Megaphone },
    { to: "/admin/profile", label: "My Profile", icon: User },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
  ],
  recruiter: [
    { to: "/recruiter", label: "Candidate Search", icon: Search },
    { to: "/recruiter/profile", label: "My Profile", icon: User },
  ],
};

export default function Sidebar({ isMobile = false, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navLinks = roleNav[user?.role] || [];

  const isActive = (path) => {
    if (path === "/student" && location.pathname === "/student") return true;
    if (path !== "/student" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // In mobile mode, render a full-width sidebar without collapse controls
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  const handleLinkClick = () => {
    if (isMobile && onClose) onClose();
  };

  return (
    <aside
      className={
        isMobile
          ? "flex h-full w-64 flex-col bg-brand-brown-900 border-r border-brand-brown-700"
          : `hidden flex-col border-r border-brand-brown-700 bg-brand-brown-900 transition-all duration-300 ease-in-out md:flex ${isCollapsed ? "w-16" : "w-56"}`
      }
    >
      {/* 1. Header & Toggle Button */}
      <div className={`flex h-14 items-center border-b border-brand-brown-700 px-3 ${effectiveCollapsed ? "justify-center" : "justify-between"}`}>

        {/* Logo Section */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 min-w-[2rem] items-center justify-center rounded-lg bg-gradient-to-br from-brand-amber-500 to-[#E89B60] text-white shadow-md shadow-[#C07840]/20">
            <GraduationCap size={18} />
          </div>

          {!effectiveCollapsed && (
            <div className="flex flex-col transition-opacity duration-300">
              <span className="whitespace-nowrap text-sm font-bold leading-none text-white">
                NIT KKR
              </span>
              <span className="mt-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-brand-beige-400">
                Placement
              </span>
            </div>
          )}
        </div>

        {/* Collapse Button (desktop only) */}
        {!isMobile && !isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded p-0.5 text-brand-beige-400 hover:bg-brand-brown-700 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Re-open button when collapsed (desktop only) */}
      {!isMobile && isCollapsed && (
        <div className="flex justify-center py-2 border-b border-brand-brown-700">
          <button
            onClick={() => setIsCollapsed(false)}
            className="rounded p-1 text-brand-beige-400 hover:bg-brand-brown-700 hover:text-white"
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
              onClick={handleLinkClick}
              title={effectiveCollapsed ? label : ""}
              className={`flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors ${
                isActive(to)
                  ? "bg-brand-amber-500 text-white font-medium shadow-sm"
                  : "text-brand-beige-300 hover:bg-brand-brown-800 hover:text-white"
              } ${effectiveCollapsed ? "justify-center" : ""}`}
            >
              <Icon size={20} className="shrink-0" />

              {!effectiveCollapsed && (
                <span className="whitespace-nowrap text-sm font-medium transition-opacity duration-300">
                  {label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* 3. Bottom Actions */}
      <div className="border-t border-brand-brown-700 p-3">
        <button
          onClick={() => { logout(); if (isMobile && onClose) onClose(); }}
          title={effectiveCollapsed ? "Sign Out" : ""}
          className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors ${
            effectiveCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {!effectiveCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}