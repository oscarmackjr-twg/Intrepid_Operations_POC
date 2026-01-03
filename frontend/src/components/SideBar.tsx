import React from "react";
import { NavLink } from "react-router-dom";

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: "/", label: "All Runs" },
    { to: "/runs/recent", label: "Recent Runs" },
    { to: "/runs/failed", label: "Failed Runs" },
    // Add or change items to match your actual routes
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50">

      <div className="px-4 py-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">
        Navigation
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center px-3 py-2 rounded-lg text-sm",
                "hover:bg-slate-800 hover:text-slate-50",
                isActive
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-300",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
        Previous runs are listed on the{" "}
        <span className="font-medium text-slate-300">All Runs</span> page.
      </div>
    </div>
  );
};
