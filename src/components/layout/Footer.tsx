import React from 'react';
import { Shield, Phone, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenHelp: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHelp }) => {
  return (
    <footer className="mt-auto bg-[#f3ede2] border-t border-[#e2dacf] text-slate-600 text-sm py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Mandatory Disclaimer */}
        <div className="flex items-center gap-2.5 text-center md:text-left">
          <Shield className="w-5 h-5 text-teal-700 shrink-0" />
          <p className="font-medium text-slate-700">
            SWMS supports and screens. It does not diagnose or replace professional care.
          </p>
        </div>

        {/* Quick Links & Emergency Line */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <button
            onClick={onOpenHelp}
            className="font-semibold text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded border border-rose-200"
          >
            <Phone className="w-3.5 h-3.5" />
            Tele-MANAS: 14416 (24/7)
          </button>

          <button
            onClick={onOpenHelp}
            className="text-teal-800 hover:text-teal-950 underline underline-offset-2 font-medium inline-flex items-center gap-1"
          >
            S15 Help & Emergency Guide
            <ExternalLink className="w-3 h-3" />
          </button>

          <span className="text-slate-400">|</span>
          <span className="text-slate-500">
            NMIMS Shirpur • Dept of Computer Engineering
          </span>
        </div>
      </div>
    </footer>
  );
};
