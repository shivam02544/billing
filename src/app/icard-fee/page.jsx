"use client";
import { useState, useEffect, useCallback } from "react";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import {
  Search,
  UserCheck,
  UserX,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const SESSION = "2026-2027";

export default function IcardFeePage() {
  /* ─── state ─────────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [allStudents, setAllStudents] = useState([]); // for autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [selectedName, setSelectedName] = useState(""); // confirmed name
  const [studentFound, setStudentFound] = useState(null); // true/false/null

  const [status, setStatus] = useState(""); // TAKEN | NO_DUE
  const [dueAmount, setDueAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL | TAKEN | NO_DUE
  const [expandedId, setExpandedId] = useState(null);

  /* ─── fetch all students (for name autocomplete only) ───── */
  useEffect(() => {
    fetch("/api/studentsCrud", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAllStudents(d.data || []))
      .catch(() => {});
  }, []);

  /* ─── fetch icard fee records ────────────────────────────── */
  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const res = await fetch(`/api/icard-fee?session=${SESSION}`, {
        cache: "no-store",
      });
      const d = await res.json();
      setRecords(d.data || []);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  /* ─── search / autocomplete ──────────────────────────────── */
  const handleSearchInput = (val) => {
    setSearchQuery(val);
    setSelectedName("");
    setStudentFound(null);
    setStatus("");
    setDueAmount("");
    setNote("");

    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const q = val.toLowerCase();
    const matched = allStudents.filter((s) =>
      (s.name || "").toLowerCase().includes(q)
    );
    setSuggestions(matched.slice(0, 6));
  };

  const confirmName = (name, fromStudent = true) => {
    setSelectedName(name);
    setSearchQuery(name);
    setSuggestions([]);
    setStudentFound(fromStudent);
  };

  /* Search manually (typed name not in list) */
  const handleManualSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a name first");
      return;
    }
    const q = searchQuery.trim().toUpperCase();
    const found = allStudents.find(
      (s) => (s.name || "").toUpperCase() === q
    );
    setSelectedName(searchQuery.trim());
    setSuggestions([]);
    setStudentFound(!!found);
  };

  /* ─── submit ─────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!selectedName) {
      toast.error("Search and confirm a student name first");
      return;
    }
    if (!status) {
      toast.error("Select a status: Taken or No Due");
      return;
    }
    if (status === "TAKEN" && dueAmount && isNaN(Number(dueAmount))) {
      toast.error("Due amount must be a number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/icard-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedName,
          status,
          dueAmount: dueAmount ? Number(dueAmount) : 0,
          note,
          session: SESSION,
        }),
      });
      const d = await res.json();
      if (d.statusCode === 201) {
        toast.success(`Saved! ${d.studentFound ? "Student linked." : "Added as new entry."}`);
        setSearchQuery("");
        setSelectedName("");
        setStudentFound(null);
        setStatus("");
        setDueAmount("");
        setNote("");
        fetchRecords();
      } else {
        toast.error(d.message || "Failed to save");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── delete ─────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await fetch(`/api/icard-fee?id=${id}`, { method: "DELETE" });
      toast.success("Deleted");
      fetchRecords();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ─── filtered list ──────────────────────────────────────── */
  const filtered =
    filter === "ALL" ? records : records.filter((r) => r.status === filter);

  const counts = {
    ALL: records.length,
    TAKEN: records.filter((r) => r.status === "TAKEN").length,
    NO_DUE: records.filter((r) => r.status === "NO_DUE").length,
    DUE: records.filter((r) => r.dueAmount > 0).length,
  };

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <>
      <ResponsiveMenu />

      <div className="min-h-screen bg-orange-50 pb-10">
        {/* ── Page Header ───────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-6 shadow-md">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <CreditCard size={28} className="shrink-0" />
            <div>
              <h1 className="text-xl font-bold leading-tight">
                iCard Fee Collection
              </h1>
              <p className="text-orange-100 text-xs mt-0.5">
                Session: {SESSION} — track who&apos;s taken their iCard
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
          {/* ── Search + Add Form ────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-md p-5 border border-orange-100">
            <h2 className="text-base font-semibold text-orange-700 mb-4 flex items-center gap-2">
              <Search size={16} /> Find Student &amp; Record iCard
            </h2>

            {/* Search bar */}
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
                title="Search"
              >
                <Search size={18} />
              </button>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-orange-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s) => (
                    <li key={s._id}>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 flex justify-between items-center"
                        onClick={() => confirmName(s.name, true)}
                      >
                        <span className="font-medium text-gray-800">
                          {s.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {s.className} · {s.village}
                        </span>
                      </button>
                    </li>
                  ))}
                  {/* add as new */}
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

            {/* Student status banner */}
            {selectedName && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm mb-4 ${
                  studentFound
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                }`}
              >
                {studentFound ? (
                  <UserCheck size={16} />
                ) : (
                  <UserX size={16} />
                )}
                <span>
                  {studentFound
                    ? `Student found: ${selectedName}`
                    : `"${selectedName}" not in student list — will be added as new entry`}
                </span>
              </div>
            )}

            {/* Status buttons */}
            {selectedName && (
              <>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                  iCard Status
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setStatus("TAKEN")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                      status === "TAKEN"
                        ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-100"
                        : "bg-white text-green-600 border-green-300 hover:border-green-400"
                    }`}
                  >
                    <CheckCircle size={18} />
                    Taken
                  </button>
                  <button
                    onClick={() => setStatus("NO_DUE")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                      status === "NO_DUE"
                        ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-100"
                        : "bg-white text-blue-600 border-blue-300 hover:border-blue-400"
                    }`}
                  >
                    <CheckCircle size={18} />
                    No Due
                  </button>
                </div>

                {/* Due amount (optional) */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                    Due Amount (₹) — optional
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

                {/* Note (optional) */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                    Note — optional
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. lost icard, partial payment…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-orange-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !status}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-100"
                >
                  {submitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <PlusCircle size={16} />
                  )}
                  {submitting ? "Saving…" : "Save Record"}
                </button>
              </>
            )}
          </div>

          {/* ── Stats strip ─────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", key: "ALL", color: "orange" },
              { label: "Taken", key: "TAKEN", color: "green" },
              { label: "No Due", key: "NO_DUE", color: "blue" },
            ].map(({ label, key, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-2xl py-3 text-center shadow-sm border-2 transition-all ${
                  filter === key
                    ? `bg-${color}-500 border-${color}-500 text-white shadow-${color}-100`
                    : `bg-white border-${color}-200 text-${color}-600 hover:border-${color}-300`
                }`}
              >
                <div className="text-2xl font-bold">{counts[key]}</div>
                <div className="text-xs font-medium mt-0.5">{label}</div>
              </button>
            ))}
          </div>

          {/* ── Records List ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100">
              <h2 className="font-semibold text-gray-700 text-sm">
                Records — {SESSION}
              </h2>
              <button
                onClick={fetchRecords}
                className="text-orange-500 hover:text-orange-700 transition"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingRecords ? (
              <div className="flex justify-center items-center py-10 gap-2 text-orange-500">
                <RefreshCw size={20} className="animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No records yet.
              </div>
            ) : (
              <ul className="divide-y divide-orange-50">
                {filtered.map((rec) => (
                  <li key={rec._id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      {/* Left info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`shrink-0 w-2 h-2 rounded-full ${
                            rec.status === "TAKEN"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {rec.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {rec.studentPageId
                              ? `ID: ${rec.studentPageId}`
                              : "External"}
                            {" · "}
                            {new Date(rec.createdAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right chips + actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            rec.status === "TAKEN"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {rec.status === "TAKEN" ? "Taken" : "No Due"}
                        </span>
                        {rec.dueAmount > 0 && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                            ₹{rec.dueAmount}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === rec._id ? null : rec._id
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedId === rec._id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(rec._id)}
                          className="text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded note */}
                    {expandedId === rec._id && rec.note && (
                      <div className="mt-2 ml-5 text-xs text-gray-500 bg-orange-50 rounded-lg px-3 py-2">
                        📝 {rec.note}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Due Summary */}
          {counts.DUE > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">
                  {counts.DUE} student{counts.DUE > 1 ? "s" : ""} with pending
                  due
                </p>
                <p className="text-xs text-red-500 mt-0.5">
                  Total due: ₹
                  {records
                    .filter((r) => r.dueAmount > 0)
                    .reduce((acc, r) => acc + r.dueAmount, 0)
                    .toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
