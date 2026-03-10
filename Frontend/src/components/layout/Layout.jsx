import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* 1. Desktop Sidebar (Fixed Left) */}
      <Sidebar />

      {/* 2. Main Area (Right Side) */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header (Top) */}
        <Header toggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto min-h-[calc(100vh-150px)] max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
          <Footer role={user?.role} />
        </main>
      </div>

      {/* 3. Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        >
          <div
            className="h-full w-64 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar isMobile onClose={closeMobileMenu} />
          </div>
        </div>
      )}
    </div>
  );
}