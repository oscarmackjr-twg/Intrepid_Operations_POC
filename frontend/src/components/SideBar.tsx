// src/components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: "/", label: "All Runs" },
    { to: "/runs/recent", label: "Recent Runs" },
    { to: "/runs/failed", label: "Failed Runs" },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-4 py-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">
        Runs
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center px-3 py-2 rounded-md text-sm transition",
                isActive
                  ? "bg-[--color-brand-primary-soft] text-[--color-brand-accent] font-medium"
                  : "text-slate-700 hover:bg-slate-100",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
        Select a run to view its summary and exceptions.
      </div>
    </div>
  );
};
