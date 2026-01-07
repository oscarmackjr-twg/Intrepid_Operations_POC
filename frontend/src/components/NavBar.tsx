
// src/components/Navbar.tsx
import React from "react";
import { Link, NavLink } from "react-router-dom";

export const Navbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[--color-brand-primary] text-white">
      {/* Left: logo + app name */}
      <div className="flex items-center gap-3">
        {/* Update src to match your actual logo file */}
        <img
          src="/twg-logo.png"
          alt="TWG"
          className="h-8 w-auto"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-semibold tracking-wide">
            TWG Loan Engine
          </span>
          <span className="text-xs opacity-90">
            Portfolio Optimization Dashboard
          </span>
        </div>
      </div>

      {/* Right: navigation items */}
      <nav className="flex items-center gap-2 text-sm">
        <NavLink
          to="/"
          className={({ isActive }) =>
            [
              "px-3 py-1 rounded-full transition",
              isActive
                ? "bg-white text-[--color-brand-primary]"
                : "hover:bg-[--color-brand-primary-soft] hover:text-white",
            ].join(" ")
          }
        >
          Runs
        </NavLink>

        <NavLink
          to="/new-run"
          className={({ isActive }) =>
            [
              "px-3 py-1 rounded-full transition",
              isActive
                ? "bg-white text-[--color-brand-primary]"
                : "hover:bg-[--color-brand-primary-soft] hover:text-white",
            ].join(" ")
          }
        >
          New Run
        </NavLink>

        <NavLink
          to="/help"
          className={({ isActive }) =>
            [
              "px-3 py-1 rounded-full transition",
              isActive
                ? "bg-white text-[--color-brand-primary]"
                : "hover:bg-[--color-brand-primary-soft] hover:text-white",
            ].join(" ")
          }
        >
          Help
        </NavLink>
      </nav>
    </div>
  );
};
