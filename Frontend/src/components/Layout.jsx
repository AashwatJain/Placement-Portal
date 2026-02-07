import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer"; // Footer import kar liya

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // Flex container to put Sidebar next to Main Content
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* 1. Sidebar (Fixed Left) */}
      <Sidebar />

      {/* 2. Main Area (Right Side) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Header (Top) */}
        <Header toggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Content Wrapper (Min-height diya taki footer neeche rahe agar content kam ho) */}
          <div className="mx-auto min-h-[calc(100vh-150px)] max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>

          {/* Footer added here */}
          <Footer />
        </main>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="h-full w-64 bg-white dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
             {/* Mobile Sidebar reuse logic can go here */}
             <div className="p-4 font-bold dark:text-white">Menu</div>
          </div>
        </div>
      )}
    </div>
  );
}