"use client";
import Bill from "@/components/Bill";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, X, Clock, Hash } from "lucide-react";

const MAX_RECENT = 5;

export default function PayBillPage() {
  const [pageId, setPageId]     = useState("");
  const [showBill, setShowBill] = useState(false);
  const [recent, setRecent]     = useState([]);

  // Load recent page IDs from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recentPageIds") || "[]");
      setRecent(stored);
    } catch {}
  }, []);

  const saveRecent = (id) => {
    const updated = [id, ...recent.filter((r) => r !== id)].slice(0, MAX_RECENT);
    setRecent(updated);
    localStorage.setItem("recentPageIds", JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pageId.trim() === "") {
      toast.error("Please enter a Page ID to get the bill");
      return;
    }
    saveRecent(pageId.trim().toUpperCase());
    setShowBill(false);
    setTimeout(() => setShowBill(true), 10);
  };

  const handleQuickPick = (id) => {
    setPageId(id);
    setShowBill(false);
    setTimeout(() => setShowBill(true), 10);
  };

  return (
    <>
      <ResponsiveMenu />
      <div className="min-h-screen flex flex-col bg-orange-50">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-5">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <Hash size={20} /> Pay Bill
            </h1>
            <p className="text-orange-100 text-sm mt-0.5">Enter a student's Page ID to view and pay their bill</p>
          </div>
        </div>

        {/* Search form — sticky */}
        <div className="sticky top-14 z-20 bg-orange-50/90 backdrop-blur-sm border-b border-orange-100 px-4 py-3">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" />
                <input
                  type="text"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value.toUpperCase())}
                  placeholder="Enter Page ID (e.g. A001)"
                  className="w-full pl-10 pr-9 py-2.5 border-2 border-orange-400 rounded-xl text-gray-800 uppercase font-semibold focus:outline-none focus:border-orange-600 focus:shadow-md bg-white placeholder-gray-400 placeholder:normal-case placeholder:font-normal transition-all"
                />
                {pageId && (
                  <button
                    type="button"
                    onClick={() => { setPageId(""); setShowBill(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm active:scale-95"
              >
                Show Bill
              </button>
            </div>

            {/* Recent page IDs */}
            {recent.length > 0 && !showBill && (
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={11} /> Recent:
                </span>
                {recent.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleQuickPick(id)}
                    className="text-xs bg-white border border-orange-300 text-orange-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-orange-50 hover:border-orange-500 transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Bill display */}
        <div className="flex-1 w-full">
          {showBill ? (
            <div className="animate-fadeIn">
              <Bill pageId={pageId} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
              <div className="text-6xl mb-4">🧾</div>
              <p className="text-lg font-bold text-gray-600 mb-1">Enter a Page ID above</p>
              <p className="text-sm text-gray-400">The student's bill will appear here</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
