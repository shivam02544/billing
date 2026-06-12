"use client";
import { useState, useEffect, useMemo } from "react";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertTriangle, Phone, MessageCircle, Receipt, Search,
  X, ArrowUpDown, Users, Filter, ChevronDown, ArrowLeft,
  BookOpen, Printer, Send, Download,
} from "lucide-react";

const CLASSES = ["All", "PRE-NC", "NC", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8"];

export default function AllDefaultersPage() {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [sortBy, setSortBy] = useState("dueDesc"); // dueDesc, dueAsc, name
  const [showFilters, setShowFilters] = useState(false);
  const [smsSending, setSmsSending] = useState({});

  useEffect(() => {
    const fetchDefaulters = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/all-defaulters", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        if (data.status === 200) setDefaulters(data.data || []);
      } catch (error) {
        console.error("Error fetching defaulters:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDefaulters();
  }, []);

  // Filter & sort
  const filteredDefaulters = useMemo(() => {
    const q = search.toLowerCase();
    let result = defaulters.filter((d) => {
      const matchesSearch =
        !q ||
        (d.pageId || "").toLowerCase().includes(q) ||
        (d.fatherName || "").toLowerCase().includes(q) ||
        (d.contact || "").includes(q) ||
        (d.village || "").toLowerCase().includes(q) ||
        d.siblings.some((s) => (s.name || "").toLowerCase().includes(q));

      const matchesClass =
        classFilter === "All" ||
        d.siblings.some((s) => s.className === classFilter);

      return matchesSearch && matchesClass;
    });

    // Sort
    if (sortBy === "dueDesc") result.sort((a, b) => b.totalDue - a.totalDue);
    else if (sortBy === "dueAsc") result.sort((a, b) => a.totalDue - b.totalDue);
    else if (sortBy === "name") result.sort((a, b) => (a.siblings[0]?.name || "").localeCompare(b.siblings[0]?.name || ""));

    return result;
  }, [defaulters, search, classFilter, sortBy]);

  const totalOutstanding = filteredDefaulters.reduce((sum, d) => sum + (d.totalDue || 0), 0);
  const totalFamilies = filteredDefaulters.length;

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const avatarColors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-rose-500", "bg-pink-500", "bg-red-600"];
  const getColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

  const makeWhatsApp = (contact, names, due) => {
    const msg = encodeURIComponent(
      `Dear Parent,\n\nYour child(ren) ${names} have pending school fees of ₹${due}.\n\nPlease pay at the earliest.\n\nNew Progressive Public School, Nauroo, Jehanabad.`
    );
    return `https://wa.me/91${contact}?text=${msg}`;
  };

  const handleSendSMS = async (d) => {
    if (!d.contact || d.contact === "N/A") return;
    setSmsSending((prev) => ({ ...prev, [d.pageId]: true }));
    try {
      const primaryName = d.siblings[0]?.name || "Student";
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: primaryName,
          totalDue: d.totalDue,
          phoneNumbers: [d.contact],
        }),
      });
      const result = await response.json();
      if (response.ok && result.status === 200) {
        toast.success(`SMS sent to ${d.contact} successfully!`);
      } else {
        toast.error(`Failed: ${result.message}`);
      }
    } catch {
      toast.error("Error sending SMS");
    } finally {
      setSmsSending((prev) => ({ ...prev, [d.pageId]: false }));
    }
  };

  const hasActiveFilters = search || classFilter !== "All";

  const clearAll = () => {
    setSearch("");
    setClassFilter("All");
  };

  return (
    <>
      <ResponsiveMenu />
      <div className="min-h-screen bg-orange-50">

        {/* ── Header ─────────────────────────────── */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <AlertTriangle size={24} /> All Defaulters
            </h1>
            <p className="text-orange-100 text-sm mt-1">
              Students with pending dues — grouped by family (Page ID). Contact parents to collect fees.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-5 space-y-4">

          {/* ── Summary Cards ───────────────────── */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fadeIn">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total Families</p>
                <p className="text-2xl font-extrabold text-gray-800">{totalFamilies}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total Students</p>
                <p className="text-2xl font-extrabold text-gray-800">
                  {filteredDefaulters.reduce((sum, d) => sum + d.siblings.length, 0)}
                </p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 shadow-sm border border-red-100">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Outstanding</p>
                <p className="text-2xl font-extrabold text-red-600">₹{totalOutstanding.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Avg Due/Family</p>
                <p className="text-2xl font-extrabold text-orange-600">
                  ₹{totalFamilies > 0 ? Math.round(totalOutstanding / totalFamilies).toLocaleString() : 0}
                </p>
              </div>
            </div>
          )}

          {/* ── Search + Filter bar ─────────────── */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, Page ID, father, village, contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border-2 border-orange-200 rounded-2xl focus:outline-none focus:border-orange-500 bg-white text-gray-800 placeholder-gray-400 shadow-sm transition-all text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={15} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold transition-colors ${
                  showFilters || classFilter !== "All"
                    ? "bg-orange-500 text-white"
                    : "bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                }`}
              >
                <Filter size={14} /> Filter
                {classFilter !== "All" && (
                  <span className="w-5 h-5 bg-white text-orange-600 rounded-full text-[10px] font-extrabold flex items-center justify-center">1</span>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => {
                    if (sortBy === "dueDesc") setSortBy("dueAsc");
                    else if (sortBy === "dueAsc") setSortBy("name");
                    else setSortBy("dueDesc");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  title={`Sort: ${sortBy === "dueDesc" ? "Highest due" : sortBy === "dueAsc" ? "Lowest due" : "By name"}`}
                >
                  <ArrowUpDown size={14} />
                  {sortBy === "dueDesc" ? "Highest Due" : sortBy === "dueAsc" ? "Lowest Due" : "By Name"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Filter panel ───────────────────── */}
          {showFilters && (
            <div className="bg-white border border-orange-200 rounded-2xl p-4 animate-slideDown shadow-sm">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Class</label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>{c === "All" ? "All Classes" : `Class ${c}`}</option>
                    ))}
                  </select>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Result count ───────────────────── */}
          {!loading && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-red-600">{filteredDefaulters.length}</span> of {defaulters.length} families
                {hasActiveFilters && <span className="text-gray-400"> · filtered</span>}
              </p>
              {hasActiveFilters && (
                <button onClick={clearAll} className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* ── Loading skeleton ───────────────── */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-48 rounded" />
                      <div className="skeleton h-3 w-72 rounded" />
                    </div>
                    <div className="skeleton h-8 w-24 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDefaulters.length > 0 ? (
            /* ── Defaulter rows ─────────────────── */
            <div className="space-y-3 animate-fadeIn">
              {filteredDefaulters.map((d, idx) => (
                <div
                  key={`${d.pageId}-${idx}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Main row */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                      {/* Left: Avatar + Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`${getColor(d.siblings[0]?.name || "?")} w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                          {getInitials(d.siblings[0]?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Siblings names & classes */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            {d.siblings.map((s, si) => (
                              <span key={si} className="flex items-center gap-1">
                                <span className="font-bold text-gray-800 text-sm">{s.name}</span>
                                <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">{s.className}</span>
                                {si < d.siblings.length - 1 && <span className="text-gray-300 mx-0.5">·</span>}
                              </span>
                            ))}
                          </div>
                          {/* Meta info */}
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            <span className="text-xs text-gray-500">
                              Page ID: <span className="font-semibold text-gray-700">{d.pageId}</span>
                            </span>
                            {d.fatherName && (
                              <span className="text-xs text-gray-500">
                                Father: <span className="font-semibold text-gray-700">{d.fatherName}</span>
                              </span>
                            )}
                            {d.village && (
                              <span className="text-xs text-gray-500">
                                Village: <span className="font-semibold text-gray-700">{d.village}</span>
                              </span>
                            )}
                            {d.contact && d.contact !== "N/A" && (
                              <span className="text-xs text-gray-500">
                                📞 <span className="font-semibold text-gray-700">{d.contact}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Due amount + Action buttons */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                        {/* Due badge */}
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center min-w-[100px]">
                          <p className="text-[10px] font-bold text-red-500 uppercase">Due</p>
                          <p className="text-lg font-extrabold text-red-600">₹{d.totalDue?.toLocaleString()}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-1.5">
                          {d.contact && d.contact !== "N/A" && (
                            <>
                              <a
                                href={`tel:${d.contact}`}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-semibold rounded-lg transition-colors"
                                title="Call parent"
                              >
                                <Phone size={11} /> Call
                              </a>
                              <a
                                href={makeWhatsApp(d.contact, d.siblings.map(s => s.name).join(", "), d.totalDue)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-semibold rounded-lg transition-colors"
                                title="Send WhatsApp"
                              >
                                <MessageCircle size={11} /> WhatsApp
                              </a>
                              <button
                                onClick={() => handleSendSMS(d)}
                                disabled={smsSending[d.pageId]}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                                title="Send SMS"
                              >
                                {smsSending[d.pageId] ? (
                                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Send size={11} />
                                )}
                                SMS
                              </button>
                            </>
                          )}
                          <Link
                            href={`/searchStudent`}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-semibold rounded-lg transition-colors"
                            title="Pay bill"
                          >
                            <Receipt size={11} /> Pay Bill
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── Empty state ─────────────────────── */
            <div className="text-center py-16 animate-fadeIn">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-lg font-bold text-gray-700 mb-1">No defaulters found!</p>
              <p className="text-sm text-gray-400">
                {hasActiveFilters
                  ? "No students match your current filters."
                  : "All students are up to date with their payments."}
              </p>
              {hasActiveFilters && (
                <button onClick={clearAll} className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* ── Bottom summary bar ──────────────── */}
          {!loading && filteredDefaulters.length > 0 && (
            <div className="bg-red-600 text-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 shadow-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} />
                <div>
                  <p className="font-bold">
                    {totalFamilies} families · ₹{totalOutstanding.toLocaleString()} total outstanding
                  </p>
                  <p className="text-red-200 text-xs">Contact parents to collect pending fees</p>
                </div>
              </div>
              <Link
                href="/announcement"
                className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
              >
                <Send size={14} /> Send Bulk Announcement
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
