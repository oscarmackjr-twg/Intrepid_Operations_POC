// src/components/Layout.tsx
import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">


      {/* Top navigation bar with TWG branding (handled inside <Navbar />) */}
      <header className="border-b border-slate-800">
        <Navbar />
      </header>

      {/* Main app area: sidebar + main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar for navigation / previous runs */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950/60 backdrop-blur">

          <Sidebar />
        </aside>

        {/* Primary content area */}

        <main className="flex-1 p-6 overflow-auto bg-white">

          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">

        <Footer />
      </footer>
    </div>
  );
};
