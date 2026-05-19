"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, Settings, ArrowUpRight, FileText, Bell, CreditCard } from "lucide-react";

export default function StickyMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const pathname = usePathname();

  // Close menu when clicking outside
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
    window.open(path, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  if (pathname === '/studentBills' || pathname === '/getStudentsBill' || pathname === '/' || pathname === '/icard-fee') {
    return null;
  }

  return (
    <div className="fixed top-24 right-4 z-40" ref={menuRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
          title="More Options"
        >
          <Menu size={24} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
            <div className="py-1 flex flex-col">
              
              <button
                onClick={() => handleLinkClick("/announcement")}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-orange-500" />
                  <span className="font-medium">Announcements</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-blue-500" />
              </button>

              <button
                onClick={() => handleLinkClick("/important-fees")}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-orange-500" />
                  <span className="font-medium">Important Fees</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-blue-500" />
              </button>

              <button
                onClick={() => handleLinkClick("/icard-fee")}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-orange-500" />
                  <span className="font-medium">iCard Fee</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-blue-500" />
              </button>

              <button
                onClick={() => handleLinkClick("/export-data")}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-gray-500 dark:text-gray-400" />
                  <span>Database Tools</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-blue-500" />
              </button>

              <button
                onClick={() => handleLinkClick("#")}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Settings size={16} className="text-gray-500 dark:text-gray-400" />
                  <span>Tools & Macros</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-blue-500" />
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
