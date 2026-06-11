"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, UserPlus, FileText, Receipt, CreditCard, LayoutDashboard, Search, LogOut, Calculator } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const MORE_LINKS = [
  { href: "/addNewStudent",   label: "Add New Student",  icon: UserPlus   },
  { href: "/generateBill",   label: "Generate Bills",   icon: Receipt    },
  { href: "/About",          label: "Fee Structure",    icon: FileText   },
  { href: "/icard-fee",      label: "iCard Fee",        icon: CreditCard },
  { href: "/age-calculator", label: "Age Calculator",   icon: Calculator },
];

const SimpleMenu = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen,   setMoreOpen]   = useState(false);
  const [session,    setSession]    = useState("2026-2027");

  const navRef  = useRef(null);
  const moreRef = useRef(null);

  /* Read stored session on mount — default to 2026-2027 (current) */
  useEffect(() => {
    const stored = localStorage.getItem("currentSession");
    const active = stored || "2026-2027";
    setSession(active);
    localStorage.setItem("currentSession", active);
    document.cookie = `currentSession=${active}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, []);

  const handleSessionChange = (e) => {
    const newSession = e.target.value;
    setSession(newSession);
    localStorage.setItem("currentSession", newSession);
    document.cookie = `currentSession=${newSession}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload(); // reload so all API calls pick up the new session cookie
  };

  const handleLogout = () => {
    document.cookie = "token=;";
    toast.success("Logout successfully...");
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

  return (
    <nav ref={navRef} className="bg-orange-600 text-white p-4 z-30 sticky top-0 w-full shadow-md">
      <div className="flex justify-between items-center max-w-5xl mx-auto">

        {/* Brand */}
        <h1 className="text-xl font-bold tracking-wide">NPPS</h1>

        {/* ── Desktop links ───────────────────────────────── */}
        <ul className="hidden md:flex gap-6 items-center font-semibold text-sm">

          {/* Session switcher */}
          <li>
            <select
              value={session}
              onChange={handleSessionChange}
              className="bg-orange-700 text-white text-sm font-semibold rounded px-2 py-1 outline-none border border-orange-500 cursor-pointer hover:bg-orange-800 transition"
              title="Switch session"
            >
              <option value="2026-2027">2026-2027 (Current)</option>
              <option value="2025-2026">2025-2026 (Old)</option>
            </select>
          </li>

          <li>
            <Link href="/dashboard" className="hover:text-orange-200 transition flex items-center gap-1.5">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/searchStudent" className="hover:text-orange-200 transition flex items-center gap-1.5">
              <Search size={15} /> Search
            </Link>
          </li>
          <li>
            <Link href="/payBill" className="hover:text-orange-200 transition flex items-center gap-1.5">
              <Receipt size={15} /> Pay Bill
            </Link>
          </li>

          {/* More dropdown */}
          <li ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className="flex items-center gap-1 hover:text-orange-200 transition focus:outline-none"
            >
              More <ChevronDown size={14} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white text-gray-700 rounded-xl shadow-xl border border-orange-100 overflow-hidden z-50">
                {MORE_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-orange-50 transition"
                  >
                    <Icon size={15} className="text-orange-500 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </li>

          <li>
            <button onClick={handleLogout} className="hover:text-orange-200 transition flex items-center gap-1.5">
              <LogOut size={15} /> Logout
            </button>
          </li>
        </ul>

        {/* ── Mobile: session + hamburger ─────────────────── */}
        <div className="md:hidden flex items-center gap-3">
          <select
            value={session}
            onChange={handleSessionChange}
            className="bg-orange-700 text-white text-xs font-semibold rounded px-2 py-1 outline-none border border-orange-500"
          >
            <option value="2026-2027">2026-2027</option>
            <option value="2025-2026">2025-2026</option>
          </select>
          <button onClick={() => setMobileOpen((o) => !o)} className="focus:outline-none">
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden mt-3 bg-orange-700 rounded-xl p-4 flex flex-col gap-1 animate-slideDown">

          {/* Primary links */}
          {[
            { href: "/dashboard",     label: "Dashboard",      Icon: LayoutDashboard },
            { href: "/searchStudent", label: "Search Students", Icon: Search },
            { href: "/payBill",       label: "Pay Bill",        Icon: Receipt },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-600 transition font-medium text-sm"
            >
              <Icon size={16} className="text-orange-200 shrink-0" /> {label}
            </Link>
          ))}

          {/* Divider */}
          <div className="border-t border-orange-500 my-1" />

          {/* More section */}
          <p className="text-orange-300 text-xs font-semibold uppercase tracking-wider px-3 mb-1">More</p>
          {MORE_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-600 transition text-sm"
            >
              <Icon size={16} className="text-orange-300 shrink-0" /> {label}
            </Link>
          ))}

          {/* Divider */}
          <div className="border-t border-orange-500 my-1" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-600 transition text-sm font-medium w-full text-left"
          >
            <LogOut size={16} className="text-orange-200 shrink-0" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default SimpleMenu;
