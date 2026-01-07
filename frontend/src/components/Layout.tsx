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
    <div className="min-h-screen flex flex-col bg-[--color-page-bg] text-slate-900 font-sans">
      {/* Branded header */}
      <header className="shadow-sm z-20">
        <Navbar />
      </header>

      {/* Sidebar + content */}
      <div className="flex flex-1 max-h-[calc(100vh-56px)]">
        <aside className="w-64 bg-white border-r border-[--color-brand-border]">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {children}
          </div>
        </main>
      </div>

      <footer className="border-t border-[--color-brand-border] bg-white text-xs text-slate-500 px-6 py-3">
        <Footer />
      </footer>
    </div>
  );
};
