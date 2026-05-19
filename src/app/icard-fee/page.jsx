"use client";
import { useState, useEffect, useCallback } from "react";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import {
  Search, UserCheck, UserX, CreditCard, CheckCircle, XCircle,
  AlertCircle, Trash2, ChevronDown, ChevronUp, PlusCircle, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const SESSION = "2026-2027";

export default function IcardFeePage() {
  /* ── state ──────────────────────────────────────────── */
  const [searchQuery, setSearchQuery]   = useState("");
  const [allStudents, setAllStudents]   = useState([]);
  const [suggestions, setSuggestions]   = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [studentFound, setStudentFound] = useState(null);

  // Two independent toggles
  const [isTaken, setIsTaken] = useState(false); // iCard issued to student
  const [isPaid,  setIsPaid]  = useState(false); // fee paid / no due

  const [dueAmount,   setDueAmount]   = useState("");
  const [note,        setNote]        = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  const [records,        setRecords]        = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [filter,         setFilter]         = useState("ALL");
  const [expandedId,     setExpandedId]     = useState(null);

  /* ── fetch students for autocomplete (read-only) ─────── */
  useEffect(() => {
    fetch("/api/studentsCrud", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAllStudents(d.data || []))
      .catch(() => {});
  }, []);

  /* ── fetch icard records ─────────────────────────────── */
  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const res = await fetch(`/api/icard-fee?session=${SESSION}`, { cache: "no-store" });
      const d   = await res.json();
      setRecords(d.data || []);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  /* ── autocomplete ────────────────────────────────────── */
  const handleSearchInput = (val) => {
    setSearchQuery(val);
    setSelectedName("");
    setStudentFound(null);
    setIsTaken(false);
    setIsPaid(false);
    setDueAmount("");
    setNote("");

    if (!val.trim()) { setSuggestions([]); return; }
    const q = val.toLowerCase();
    setSuggestions(allStudents.filter((s) => (s.name || "").toLowerCase().includes(q)).slice(0, 6));
  };

  const confirmName = (name, fromStudent = true) => {
    setSelectedName(name);
    setSearchQuery(name);
    setSuggestions([]);
    setStudentFound(fromStudent);
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim()) { toast.error("Enter a name first"); return; }
    const found = allStudents.find(
      (s) => (s.name || "").toUpperCase() === searchQuery.trim().toUpperCase()
    );
    setSelectedName(searchQuery.trim());
    setSuggestions([]);
    setStudentFound(!!found);
  };

  /* ── submit ──────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!selectedName) { toast.error("Search and confirm a student name first"); return; }
    if (!isTaken && !isPaid) { toast.error("Mark at least one: Taken or No Due (Paid)"); return; }
    if (dueAmount && isNaN(Number(dueAmount))) { toast.error("Due amount must be a number"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/icard-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedName,
          isTaken,
          isPaid,
          dueAmount: dueAmount ? Number(dueAmount) : 0,
          note,
          session: SESSION,
        }),
      });
      const d = await res.json();
      if (d.statusCode === 201) {
        toast.success(`Saved! ${d.studentFound ? "Student linked." : "Added as new entry."}`);
        setSearchQuery(""); setSelectedName(""); setStudentFound(null);
        setIsTaken(false); setIsPaid(false); setDueAmount(""); setNote("");
        fetchRecords();
      } else {
        toast.error(d.message || "Failed to save");
      }
    } catch { toast.error("Network error"); }
    finally { setSubmitting(false); }
  };

  /* ── delete ──────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await fetch(`/api/icard-fee?id=${id}`, { method: "DELETE" });
      toast.success("Deleted");
      fetchRecords();
    } catch { toast.error("Delete failed"); }
  };

  /* ── filter counts ───────────────────────────────────── */
  const counts = {
    ALL:      records.length,
    TAKEN:    records.filter((r) => r.isTaken).length,
    NOT_TAKEN:records.filter((r) => !r.isTaken).length,
    PAID:     records.filter((r) => r.isPaid).length,
    DUE:      records.filter((r) => !r.isPaid || r.dueAmount > 0).length,
  };

  const filtered = filter === "ALL"       ? records
    : filter === "TAKEN"                  ? records.filter((r) => r.isTaken)
    : filter === "NOT_TAKEN"              ? records.filter((r) => !r.isTaken)
    : filter === "PAID"                   ? records.filter((r) => r.isPaid)
    : records.filter((r) => !r.isPaid || r.dueAmount > 0);

  const totalDue = records.reduce((sum, r) => sum + (r.dueAmount || 0), 0);

  /* ── render ──────────────────────────────────────────── */
  return (
    <>
      <ResponsiveMenu />
      <div className="min-h-screen bg-orange-50 pb-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-6 shadow-md">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <CreditCard size={28} className="shrink-0" />
            <div>
              <h1 className="text-xl font-bold leading-tight">iCard Fee Collection</h1>
              <p className="text-orange-100 text-xs mt-0.5">Session: {SESSION}</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 mt-6 space-y-5">

          {/* ── Add Form ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-md p-5 border border-orange-100">
            <h2 className="text-base font-semibold text-orange-700 mb-4 flex items-center gap-2">
              <Search size={16} /> Find Student &amp; Record iCard
            </h2>

            {/* Search input */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Type student name…"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full border border-orange-300 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50"
              />
              <button
                onClick={handleManualSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700"
              >
                <Search size={18} />
              </button>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-orange-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s) => (
                    <li key={s._id}>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 flex justify-between items-center"
                        onClick={() => confirmName(s.name, true)}
                      >
                        <span className="font-medium text-gray-800">{s.name}</span>
                        <span className="text-xs text-gray-400">{s.className} · {s.village}</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 border-t border-orange-100"
                      onClick={() => confirmName(searchQuery.trim(), false)}
                    >
                      <PlusCircle size={14} />
                      Add &quot;{searchQuery}&quot; as new entry
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {/* Student banner */}
            {selectedName && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm mb-4 ${
                studentFound
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-yellow-50 text-yellow-700 border border-yellow-200"
              }`}>
                {studentFound ? <UserCheck size={16} /> : <UserX size={16} />}
                <span>
                  {studentFound
                    ? `Student found: ${selectedName}`
                    : `"${selectedName}" not in list — will be added as new`}
                </span>
              </div>
            )}

            {/* ── Two independent toggles ──────────────── */}
            {selectedName && (
              <>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
                  Select what applies (can choose both)
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">

                  {/* Taken toggle */}
                  <button
                    onClick={() => setIsTaken((v) => !v)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                      isTaken
                        ? "bg-orange-500 text-white border-orange-500 shadow-md"
                        : "bg-white text-orange-600 border-orange-300 hover:border-orange-400"
                    }`}
                  >
                    {isTaken ? <CheckCircle size={22} /> : <XCircle size={22} className="opacity-40" />}
                    <span>Taken</span>
                    <span className="text-xs font-normal opacity-80">iCard issued to student</span>
                  </button>

                  {/* No Due / Paid toggle */}
                  <button
                    onClick={() => setIsPaid((v) => !v)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                      isPaid
                        ? "bg-green-500 text-white border-green-500 shadow-md"
                        : "bg-white text-green-600 border-green-300 hover:border-green-400"
                    }`}
                  >
                    {isPaid ? <CheckCircle size={22} /> : <XCircle size={22} className="opacity-40" />}
                    <span>No Due</span>
                    <span className="text-xs font-normal opacity-80">iCard fee paid</span>
                  </button>
                </div>

                {/* Due amount — shown only if NOT paid */}
                {!isPaid && (
                  <div className="mb-3">
                    <label className="block text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                      Due Amount (₹) — if any
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={dueAmount}
                      onChange={(e) => setDueAmount(e.target.value)}
                      className="w-full border border-orange-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50"
                    />
                  </div>
                )}

                {/* Note */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                    Note — optional
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. lost card, partial payment…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-orange-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!isTaken && !isPaid)}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  {submitting ? <RefreshCw size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  {submitting ? "Saving…" : "Save Record"}
                </button>
              </>
            )}
          </div>

          {/* ── Filter tabs ───────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "ALL",      label: "All",       color: "orange" },
              { key: "TAKEN",    label: "Taken",     color: "orange" },
              { key: "NOT_TAKEN",label: "Not Taken", color: "red" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-2xl py-3 text-center border-2 transition-all text-sm ${
                  filter === key
                    ? `bg-${color}-500 border-${color}-500 text-white`
                    : `bg-white border-${color}-200 text-${color}-600 hover:border-${color}-300`
                }`}
              >
                <div className="text-xl font-bold">{counts[key]}</div>
                <div className="text-xs font-medium">{label}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "PAID", label: "Fee Paid", color: "green" },
              { key: "DUE",  label: "Has Due",  color: "red" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-2xl py-3 text-center border-2 transition-all text-sm ${
                  filter === key
                    ? `bg-${color}-500 border-${color}-500 text-white`
                    : `bg-white border-${color}-200 text-${color}-600 hover:border-${color}-300`
                }`}
              >
                <div className="text-xl font-bold">{counts[key]}</div>
                <div className="text-xs font-medium">{label}</div>
              </button>
            ))}
          </div>

          {/* ── Records list ──────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100">
              <h2 className="font-semibold text-gray-700 text-sm">Records — {SESSION}</h2>
              <button onClick={fetchRecords} className="text-orange-500 hover:text-orange-700 transition" title="Refresh">
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingRecords ? (
              <div className="flex justify-center items-center py-10 gap-2 text-orange-500">
                <RefreshCw size={20} className="animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No records yet.</div>
            ) : (
              <ul className="divide-y divide-orange-50">
                {filtered.map((rec) => (
                  <li key={rec._id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">

                      {/* Name + date */}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{rec.name}</p>
                        <p className="text-xs text-gray-400">
                          {rec.studentPageId ? `ID: ${rec.studentPageId}` : "External"}
                          {" · "}{new Date(rec.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      {/* Status chips + actions */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {/* Taken chip */}
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          rec.isTaken
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {rec.isTaken ? "✓ Taken" : "Not Taken"}
                        </span>

                        {/* Paid chip */}
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          rec.isPaid
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-500"
                        }`}>
                          {rec.isPaid ? "✓ Paid" : "Due"}
                        </span>

                        {/* Due amount */}
                        {rec.dueAmount > 0 && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                            ₹{rec.dueAmount}
                          </span>
                        )}

                        <button
                          onClick={() => setExpandedId(expandedId === rec._id ? null : rec._id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedId === rec._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <button onClick={() => handleDelete(rec._id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded note */}
                    {expandedId === rec._id && rec.note && (
                      <div className="mt-2 text-xs text-gray-500 bg-orange-50 rounded-lg px-3 py-2">
                        📝 {rec.note}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Due summary banner */}
          {totalDue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">
                  {counts.DUE} student{counts.DUE !== 1 ? "s" : ""} with pending due
                </p>
                <p className="text-xs text-red-500 mt-0.5">
                  Total due: ₹{totalDue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
