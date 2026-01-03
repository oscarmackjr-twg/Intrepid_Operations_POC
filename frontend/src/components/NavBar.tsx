import React from "react";
import { Link, NavLink } from "react-router-dom";

export const Navbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">

      {/* Left: Logo + app name */}
      <div className="flex items-center gap-3">
        {/* Update the src path to your actual TWG logo location */}
        <img
          src="/twg-logo.png"
          alt="TWG"
          className="h-8 w-auto"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-slate-100">
            TWG Loan Engine
          </span>
          <span className="text-xs text-slate-400">
            Portfolio Optimization
          </span>
        </div>
      </div>

      {/* Right: main navigation */}
      <nav className="flex items-center gap-4 text-sm">
        <NavLink
          to="/"
          className={({ isActive }) =>
            [
              "px-3 py-1 rounded-md",
              "hover:bg-slate-800 hover:text-slate-50",
              isActive ? "bg-slate-800 text-slate-50" : "text-slate-300",
            ].join(" ")
          }
        >
          Runs
        </NavLink>

        {/* Stubbed routes – adjust/remove if you don’t have these pages yet */}
        <NavLink
          to="/new-run"
          className={({ isActive }) =>
            [
              "px-3 py-1 rounded-md",
              "hover:bg-slate-800 hover:text-slate-50",
              isActive ? "bg-slate-800 text-slate-50" : "text-slate-300",
            ].join(" ")
          }
        >
          New Run
        </NavLink>

        <NavLink
          to="/help"
          className={({ isActive }) =>
            [
              "px-3 py-1 rounded-md",
              "hover:bg-slate-800 hover:text-slate-50",
              isActive ? "bg-slate-800 text-slate-50" : "text-slate-300",
            ].join(" ")
          }
        >
          Help
        </NavLink>
      </nav>
    </div>
  );
};
