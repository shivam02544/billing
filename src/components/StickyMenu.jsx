"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Settings, ArrowUpRight, FileText, Bell,
  CreditCard, Calculator, LayoutDashboard, Zap
} from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";

const MENU_ITEMS = [
  { path: "/dashboard",       label: "Dashboard",      icon: LayoutDashboard, color: "text-blue-500"   },
  { path: "/announcement",    label: "Announcements",  icon: Bell,            color: "text-orange-500" },
  { path: "/important-fees",  label: "Important Fees", icon: FileText,        color: "text-orange-500" },
  { path: "/icard-fee",       label: "iCard Fee",      icon: CreditCard,      color: "text-orange-500" },
  { path: "/export-data",     label: "Database Tools", icon: FileText,        color: "text-gray-500"   },
  { path: "/age-calculator",  label: "Age Calculator", icon: Calculator,      color: "text-indigo-500" },
  { path: "/admin-settings",  label: "App Settings",   icon: Settings,        color: "text-purple-500" },
];

const HIDDEN_PATHS = ["/studentBills", "/getStudentsBill", "/", "/icard-fee"];

export default function StickyMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);
  const { settings } = useAppSettings();
  const router   = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = (path) => {
    if (path === "#") return;
    window.open(path, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  // Only render if the admin setting says "floating" (StickyMenu)
  if (settings.sidebarStyle !== "floating") return null;

  if (HIDDEN_PATHS.includes(pathname)) return null;

  return (
    <div className="fixed top-20 right-4 z-40" ref={menuRef}>
      <div className="relative">

        {/* FAB button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
            isOpen
              ? "bg-orange-700 rotate-90 shadow-orange-400/40"
              : "bg-orange-600 hover:bg-orange-700 hover:scale-105 shadow-orange-400/30 btn-pulse"
          } text-white`}
          title="Quick Access"
          aria-label="Quick access menu"
        >
          {isOpen ? <X size={22} /> : <Zap size={20} />}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden animate-scaleIn origin-top-right">

            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5">
              <p className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={11} /> Quick Access
              </p>
            </div>

            <div className="py-1">
              {MENU_ITEMS.map(({ path, label, icon: Icon, color }) => {
                const isCurrent = pathname === path;
                const isDisabled = path === "#";
                return (
                  <button
                    key={path}
                    onClick={() => handleLinkClick(path)}
                    disabled={isDisabled}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors group ${
                      isCurrent
                        ? "bg-orange-50 text-orange-600"
                        : isDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "text-gray-700 hover:bg-orange-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={15} className={isCurrent ? "text-orange-600" : color} />
                      <span className={`font-medium ${isCurrent ? "text-orange-600 font-semibold" : ""}`}>
                        {label}
                      </span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] bg-orange-100 text-orange-600 rounded-full px-1.5 py-0.5 font-semibold">
                        Here
                      </span>
                    ) : !isDisabled ? (
                      <ArrowUpRight
                        size={13}
                        className="text-gray-300 group-hover:text-orange-500 transition-colors"
                      />
                    ) : (
                      <span className="text-[9px] text-gray-400">Soon</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
