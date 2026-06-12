"use client";

import { useState } from "react";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import { Calculator, RotateCcw, Copy, Check } from "lucide-react";

const SHORT_M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function ageAsOfDate(dob, refDate) {
  let years  = refDate.getFullYear() - dob.getFullYear();
  let months = refDate.getMonth()    - dob.getMonth();
  let days   = refDate.getDate()     - dob.getDate();
  if (days   < 0) { months--; days += new Date(refDate.getFullYear(), refDate.getMonth(), 0).getDate(); }
  if (months < 0) { years--;  months += 12; }
  return { years, months, days };
}

function fmtDate(d) {
  return `${d.getDate()} ${SHORT_M[d.getMonth()]} ${d.getFullYear()}`;
}

function dobRangeForClass(classNum, cutoffYear) {
  const age = classNum + 5;
  return {
    from: new Date(cutoffYear - age - 1, 3, 2),
    to:   new Date(cutoffYear - age,     3, 1),
  };
}

export default function AgeCalculatorPage() {
  const [dobValue,      setDobValue]      = useState("");
  const [result,        setResult]        = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [copied,        setCopied]        = useState(false);

  const today      = new Date();
  const cutoffYear = today.getFullYear();
  const cutoffDate = new Date(cutoffYear, 3, 1);

  function calculate() {
    if (!dobValue) return;
    const dob = new Date(dobValue);
    if (isNaN(dob) || dob >= cutoffDate) return;
    const cutoffAge = ageAsOfDate(dob, cutoffDate);
    const realAge   = ageAsOfDate(dob, today);
    const yrs       = cutoffAge.years;
    const suggested = yrs >= 6 && yrs <= 13 ? yrs - 5 : null;
    setResult({ cutoffAge, realAge, suggestedClass: suggested, dob });
    setSelectedClass(null);
  }

  function reset() {
    setDobValue("");
    setResult(null);
    setSelectedClass(null);
  }

  function copyResult() {
    if (!result) return;
    const yrs = result.cutoffAge.years;
    const text = result.suggestedClass
      ? `Age on April 1: ${yrs}y ${result.cutoffAge.months}m ${result.cutoffAge.days}d → Suggested Class: ${result.suggestedClass}`
      : `Age on April 1: ${yrs}y ${result.cutoffAge.months}m ${result.cutoffAge.days}d → Outside range (Class 1–8)`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const yrs = result?.cutoffAge?.years;

  return (
    <>
      <ResponsiveMenu />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Calculator size={24} /> Age & Class Calculator
          </h1>
          <p className="text-orange-100 text-sm mt-1">
            Find the right admission class based on date of birth
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-orange-50 px-4 py-6">
        <div className="max-w-xl mx-auto space-y-4">

          {/* Input card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-slideUp">
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              Date of Birth
            </label>
            <input
              type="date"
              value={dobValue}
              onChange={e => setDobValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && calculate()}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-800 focus:outline-none focus:border-orange-500 focus:shadow-sm transition-all mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={calculate}
                disabled={!dobValue}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
              >
                <Calculator size={16} /> Check Class
              </button>
              {result && (
                <>
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-600 hover:text-orange-600 font-semibold text-sm transition-all"
                    title="Copy result"
                  >
                    {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-500 font-semibold text-sm transition-all"
                    title="Reset"
                  >
                    <RotateCcw size={15} /> Reset
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Result */}
          {result && (
            <>
              {/* Main result card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 animate-slideUp">

                {/* Real age */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    🎂
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real Age Today</p>
                    <p className="text-base font-bold text-gray-800">
                      {result.realAge.years} yrs, {result.realAge.months} mo, {result.realAge.days} days
                    </p>
                    <p className="text-xs text-gray-400">Born on {fmtDate(result.dob)}</p>
                  </div>
                </div>

                {/* Suggested class */}
                {yrs < 6 ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-3xl mb-2">😕</p>
                    <p className="font-bold text-red-600 text-base">Too Young for Admission</p>
                    <p className="text-sm text-gray-600 mt-1">Age on April 1:</p>
                    <span className="inline-block mt-1.5 bg-red-100 text-red-600 font-bold rounded-full px-4 py-1 text-sm">
                      {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                    </span>
                    <p className="text-xs text-gray-500 mt-2">Minimum age for Class 1 is 6 years.</p>
                  </div>
                ) : yrs > 13 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="font-bold text-yellow-700 text-base">Too Old for Class 1–8</p>
                    <p className="text-sm text-gray-600 mt-1">Age on April 1:</p>
                    <span className="inline-block mt-1.5 bg-yellow-100 text-yellow-700 font-bold rounded-full px-4 py-1 text-sm">
                      {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                    </span>
                    <p className="text-xs text-gray-500 mt-2">Please check Class 9 and above.</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl p-5 text-white text-center">
                    <p className="text-xs text-orange-200 mb-1 uppercase tracking-widest font-bold">Suggested Class</p>
                    <p className="text-6xl font-extrabold mb-3">{result.suggestedClass}</p>
                    <p className="text-orange-200 text-xs mb-1.5">Age on April 1</p>
                    <span className="inline-block bg-white/20 text-white font-bold rounded-full px-4 py-1 text-sm border border-white/30">
                      {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                    </span>
                  </div>
                )}
              </div>

              {/* Class picker */}
              {result.suggestedClass && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-slideUp">
                  <p className="text-sm font-bold text-gray-700 mb-0.5">Check a different class</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Tap a class to verify eligibility. <span className="text-orange-500 font-bold">★</span> = suggested
                  </p>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(c => {
                      const isActive    = selectedClass === c;
                      const isSuggested = result.suggestedClass === c;
                      return (
                        <button
                          key={c}
                          onClick={() => setSelectedClass(c)}
                          className={`relative rounded-xl py-3 text-sm font-bold border-2 transition-all active:scale-95 ${
                            isActive
                              ? "bg-orange-600 text-white border-orange-600 shadow-md"
                              : "bg-orange-50 text-gray-700 border-orange-200 hover:bg-orange-100 hover:border-orange-400"
                          }`}
                        >
                          {isSuggested && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center shadow">
                              ★
                            </span>
                          )}
                          {c}
                          <span className={`block text-[10px] font-normal mt-0.5 ${isActive ? "text-orange-200" : "text-gray-400"}`}>
                            Age {c + 5}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedClass && (() => {
                    const requiredAge = selectedClass + 5;
                    const range = dobRangeForClass(selectedClass, cutoffYear);
                    const d = new Date(result.dob.getFullYear(), result.dob.getMonth(), result.dob.getDate());
                    const match =
                      d >= new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate()) &&
                      d <= new Date(range.to.getFullYear(),   range.to.getMonth(),   range.to.getDate());

                    return (
                      <div className={`rounded-xl p-4 border-2 animate-scaleIn ${match ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                        {match ? (
                          <>
                            <p className="text-green-700 font-bold text-base mb-2">✓ Eligible for Class {selectedClass}</p>
                            <p className="text-sm text-gray-600 mb-1">Age on April 1:</p>
                            <span className="inline-block bg-green-100 text-green-700 font-bold rounded-full px-4 py-1 text-sm">
                              {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                            </span>
                            <p className="text-xs text-gray-500 mt-2">Exactly what Class {selectedClass} needs ✓</p>
                          </>
                        ) : (
                          <>
                            <p className="text-red-600 font-bold text-base mb-2">✗ Not eligible for Class {selectedClass}</p>
                            <p className="text-sm text-gray-600 mb-1">This student's age on April 1:</p>
                            <span className="inline-block bg-red-100 text-red-600 font-bold rounded-full px-4 py-1 text-sm">
                              {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                            </span>
                            <p className="text-sm text-gray-600 mt-2">
                              Class {selectedClass} needs <strong>{requiredAge} years</strong> — correct class is{" "}
                              <strong className="text-orange-600">Class {result.suggestedClass}</strong>.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Born between <strong>{fmtDate(range.from)}</strong> and <strong>{fmtDate(range.to)}</strong> for Class {selectedClass}.
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
