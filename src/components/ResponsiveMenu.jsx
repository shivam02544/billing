"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu, X, ChevronDown, UserPlus, FileText, Receipt,
  CreditCard, LayoutDashboard, Search, LogOut, Calculator, CalendarDays, CloudUpload, Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSettings } from "@/hooks/useAppSettings";
import toast from "react-hot-toast";

const MORE_LINKS = [
  { href: "/addNewStudent",      label: "Add New Student",  icon: UserPlus     },
  { href: "/generateBill",       label: "Generate Bills",   icon: Receipt      },
  { href: "/About",              label: "Fee Structure",    icon: FileText     },
  { href: "/icard-fee",          label: "iCard Fee",        icon: CreditCard   },
  { href: "/age-calculator",     label: "Age Calculator",   icon: Calculator   },
  { href: "/adminUploads",       label: "Admin Uploads",    icon: CloudUpload  },
  { href: "/admin-settings",     label: "App Settings",     icon: Settings     },
];


const PRIMARY_LINKS = [
  { href: "/dashboard",     label: "Dashboard",  icon: LayoutDashboard },
  { href: "/searchStudent", label: "Search",     icon: Search          },
  { href: "/payBill",       label: "Pay Bill",   icon: Receipt         },
];

const SimpleMenu = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen,   setMoreOpen]   = useState(false);
  const [session,    setSession]    = useState("2026-2027");
  const [scrolled,   setScrolled]   = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const pathname = usePathname();
  const navRef   = useRef(null);
  const moreRef  = useRef(null);
  const { settings } = useAppSettings();

  /* Read stored session on mount */
  useEffect(() => {
    const stored = localStorage.getItem("currentSession");
    const active = stored || "2026-2027";
    setSession(active);
    localStorage.setItem("currentSession", active);
    document.cookie = `currentSession=${active}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setIsLoggedIn(document.cookie.includes("token="));
  }, []);

  /* Scroll detection for nav elevation */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSessionChange = (e) => {
    const newSession = e.target.value;
    setSession(newSession);
    localStorage.setItem("currentSession", newSession);
    document.cookie = `currentSession=${newSession}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  };

  const handleLogout = () => {
    document.cookie = "token=;";
    toast.success("Logged out successfully!");
    window.location.reload();
  };

  /* Close mobile menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Close More dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href) => pathname === href;

  return (
    <nav
      ref={navRef}
      className={`bg-orange-600 text-white z-30 sticky top-0 w-full transition-shadow duration-200 ${
        scrolled ? "shadow-lg shadow-orange-900/20" : "shadow-md"
      }`}
    >
      <div className="flex justify-between items-center max-w-6xl mx-auto px-4 h-14">

        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="text-xl font-extrabold tracking-wide group-hover:text-orange-100 transition-colors">
            NPPS
          </span>
          <span className="hidden sm:inline text-[10px] text-orange-200 font-medium leading-tight max-w-[100px]">
            School Management
          </span>
        </Link>

        {/* ── Desktop links ─────────────────────────── */}
        <ul className="hidden md:flex gap-1 items-center font-semibold text-sm">

          {/* Session switcher */}
          <li>
            <div className="flex items-center gap-1.5 bg-orange-700 rounded-lg px-2.5 py-1.5 mr-2 border border-orange-500">
              <CalendarDays size={13} className="text-orange-200" />
              <select
                value={session}
                onChange={handleSessionChange}
                className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer"
                title="Switch session"
              >
                <option value="2026-2027">2026-2027 (Current)</option>
                <option value="2025-2026">2025-2026 (Old)</option>
              </select>
            </div>
          </li>

          {(isLoggedIn ? PRIMARY_LINKS : PRIMARY_LINKS.filter(l => l.href === '/searchStudent')).map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive(href)
                    ? "bg-white/20 text-white font-bold"
                    : "hover:bg-white/10 hover:text-orange-100"
                }`}
              >
                <Icon size={14} />
                {label}
                {isActive(href) && (
                  <span className="block w-1 h-1 rounded-full bg-white ml-0.5" />
                )}
              </Link>
            </li>
          ))}

          {/* More dropdown */}
          {isLoggedIn && (
            <li ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  moreOpen ? "bg-white/20" : "hover:bg-white/10"
                } focus:outline-none`}
              >
                More
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white text-gray-700 rounded-xl shadow-xl border border-orange-100 overflow-hidden z-50 animate-slideDown">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
                    More Options
                  </div>
                  {MORE_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive(href)
                          ? "bg-orange-50 text-orange-600 font-semibold"
                          : "hover:bg-orange-50"
                      }`}
                    >
                      <Icon size={15} className="text-orange-500 shrink-0" />
                      {label}
                      {isActive(href) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          )}

          <li>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-100 transition-all ml-1"
                title="Logout"
              >
                <LogOut size={14} /> Logout
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all ml-1"
                title="Login"
              >
                <LogOut size={14} className="rotate-180" /> Login
              </Link>
            )}
          </li>
        </ul>

        {/* ── Mobile: session + hamburger ──────────── */}
        <div className="md:hidden flex items-center gap-2">
          <div className="flex items-center gap-1 bg-orange-700 rounded-lg px-2 py-1 border border-orange-500">
            <CalendarDays size={11} className="text-orange-200" />
            <select
              value={session}
              onChange={handleSessionChange}
              className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="2026-2027">2026-27</option>
              <option value="2025-2026">2025-2026 (Old)</option>
            </select>
          </div>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-orange-700 border-t border-orange-500 px-4 pb-4 pt-2 flex flex-col gap-1 animate-slideDown">
          {/* Primary links */}
          {(isLoggedIn ? PRIMARY_LINKS : PRIMARY_LINKS.filter(l => l.href === '/searchStudent')).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isActive(href)
                  ? "bg-white/25 text-white font-bold"
                  : "hover:bg-orange-600"
              }`}
            >
              <Icon size={16} className="text-orange-200 shrink-0" />
              {label}
              {isActive(href) && (
                <span className="ml-auto text-[10px] bg-white/20 rounded px-1.5 py-0.5">Active</span>
              )}
            </Link>
          ))}

          {isLoggedIn && (
            <>
              <div className="border-t border-orange-500/60 my-1.5" />
              <p className="text-orange-300 text-[10px] font-bold uppercase tracking-wider px-3 mb-1">
                More
              </p>

              {MORE_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive(href)
                      ? "bg-white/25 text-white font-semibold"
                      : "hover:bg-orange-600"
                  }`}
                >
                  <Icon size={16} className="text-orange-300 shrink-0" />
                  {label}
                </Link>
              ))}
            </>
          )}

          <div className="border-t border-orange-500/60 my-1.5" />
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-600/40 transition-colors text-sm font-medium w-full text-left"
            >
              <LogOut size={16} className="text-orange-200 shrink-0" />
              Logout
            </button>
          ) : (
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium w-full text-left"
            >
              <LogOut size={16} className="text-orange-200 shrink-0 rotate-180" />
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default SimpleMenu;
