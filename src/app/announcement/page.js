"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Send, Megaphone, CheckCircle2 } from "lucide-react";
import SimpleMenu from "@/components/ResponsiveMenu";

const MAX_CHARS = 1000;

const TEMPLATES = [
  {
    label: "📅 Holiday Notice",
    text: "प्रिय अभिभावक,\n\nआपको सूचित किया जाता है कि कल विद्यालय में अवकाश रहेगा।\n\nधन्यवाद।",
  },
  {
    label: "💰 Fee Reminder",
    text: "प्रिय अभिभावक,\n\nकृपया इस माह की स्कूल फीस जमा करें। समय पर फीस जमा करना अनिवार्य है।\n\nधन्यवाद।",
  },
  {
    label: "📝 Exam Alert",
    text: "प्रिय अभिभावक,\n\nआगामी परीक्षा की सूचना दी जाती है। कृपया अपने बच्चे को तैयार करें।\n\nधन्यवाद।",
  },
  {
    label: "🎉 Festival Greetings",
    text: "प्रिय अभिभावक,\n\nआप सभी को हार्दिक शुभकामनाएं। इस त्योहार का आनंद उठाएं।\n\nधन्यवाद।",
  },
];

export default function AnnouncementPage() {
  const [message,      setMessage]      = useState("");
  const [loading,      setLoading]      = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [sent,         setSent]         = useState(false);

  const handleSend = async () => {
    if (!message.trim()) { toast.error("Please enter a message."); return; }
    setLoading(true);
    setIsConfirming(false);
    try {
      const response = await fetch("/api/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Message sent to ${data.recipientsCount} numbers!`);
        setMessage("");
        setSent(true);
        setTimeout(() => setSent(false), 4000);
      } else {
        toast.error(data.message || "Failed to send announcement.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const charCount = message.length;
  const charPercent = Math.min((charCount / MAX_CHARS) * 100, 100);
  const charColor = charCount > MAX_CHARS * 0.9 ? "text-red-500" : charCount > MAX_CHARS * 0.7 ? "text-yellow-600" : "text-gray-400";

  const SUFFIX = `\n\nNew Progressive Public School, Nauroo\nJehanabad.\n(यह एक स्वचालित संदेश है, कृपया इसका उत्तर न दें।)\n~Antesh Sir`;

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <SimpleMenu />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Megaphone size={24} /> Send Announcement
          </h1>
          <p className="text-orange-100 text-sm mt-1">
            Broadcast messages to all student contacts via SMS
          </p>
        </div>
      </div>

      <main className="flex-grow px-4 py-6">
        <div className="max-w-5xl mx-auto">

          {/* Sent success */}
          {sent && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3 mb-4 animate-bounceIn">
              <CheckCircle2 size={22} className="text-green-500 shrink-0" />
              <div>
                <p className="font-bold text-green-700">Announcement sent successfully!</p>
                <p className="text-xs text-green-600">All active numbers have been notified.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* ── Left: Compose ───────────────────── */}
            <div className="lg:col-span-3 space-y-4">



              {/* Quick templates */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Templates</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => { setMessage(t.text); setIsConfirming(false); }}
                      className="text-left text-xs font-semibold text-gray-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl px-3 py-2.5 transition-colors"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compose area */}
              {!isConfirming ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Announcement Message
                  </label>
                  <textarea
                    className="w-full h-44 p-3.5 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 focus:outline-none resize-none text-sm text-gray-800 transition-all"
                    placeholder="Type your message here... (e.g., Dear Parents, school will be closed tomorrow due to Holi...)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                    disabled={loading}
                  />
                  {/* Char counter */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 mr-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          charCount > MAX_CHARS * 0.9 ? "bg-red-400" : "bg-orange-400"
                        }`}
                        style={{ width: `${charPercent}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${charColor}`}>
                      {charCount}/{MAX_CHARS}
                    </span>
                  </div>


                </div>
              ) : (
                /* Preview mode */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" /> Message Preview
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 whitespace-pre-wrap text-sm text-gray-700 font-medium leading-relaxed">
                    {message.trim()}{SUFFIX}
                  </div>

                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                {!isConfirming ? (
                  <button
                    onClick={() => {
                      if (!message.trim()) { toast.error("Please enter a message."); return; }
                      setIsConfirming(true);
                    }}
                    disabled={loading || !message.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <Send size={16} /> Review & Send
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsConfirming(false)}
                      disabled={loading}
                      className="flex-1 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                    >
                      ← Edit Message
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold py-3 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "✅ Broadcast Now"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ── Right: Live Preview ──────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-20">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Live Preview</p>
                <div className="bg-[#e9fbe9] rounded-2xl p-4 min-h-[200px]">
                  {/* Simulated SMS bubble */}
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[90%] ml-auto">
                    {message.trim() ? (
                      <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {message.trim()}{SUFFIX}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Your message will appear here...</p>
                    )}
                  </div>
                  <div className="text-right mt-1.5">
                    <span className="text-[10px] text-gray-400">Delivered ✓✓</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Simulated SMS preview
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
