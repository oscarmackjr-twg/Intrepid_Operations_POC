// src/components/Footer.tsx
import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center text-sm text-gray-600">
        <p className="max-w-md">
          This is a demo application:{" "}
          <a
            href="mailto:omack@twgglobal.com"
            className="text-blue-700 hover:underline"
          >
            omack@twgglobal.com
          </a>
        </p>
        <div className="flex items-center gap-4">
          <span>&copy; 2025 TWG Global</span>
          <a href="#" className="hover:underline">
            Legal
          </a>
        </div>
      </div>
    </footer>
  );
};
