"use client";

import { useState } from "react";
import ResponsiveMenu from "@/components/ResponsiveMenu";

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

  const yrs = result?.cutoffAge?.years;

  return (
    <>
      <ResponsiveMenu />

      <div className="min-h-screen bg-orange-50 px-4 py-8">
        <div className="max-w-xl mx-auto space-y-5">

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-orange-600 mb-1">Age & Class Calculator</h1>
            <p className="text-sm text-gray-500">Enter student&apos;s date of birth to find the right admission class</p>
          </div>

          {/* Input card */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={dobValue}
              onChange={e => setDobValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && calculate()}
              className="w-full border border-orange-400 rounded-md p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition mb-4"
            />
            <button
              onClick={calculate}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Check Class
            </button>
          </div>

          {/* Result */}
          {result && (
            <>
              {/* Main result card */}
              <div className="bg-white rounded-lg shadow-md p-5 space-y-4">

                {/* Real age line */}
                <div className="flex items-center gap-3 pb-4 border-b border-orange-100">
                  <span className="text-3xl">🎂</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Real Age Today</p>
                    <p className="text-base font-bold text-gray-800">
                      {result.realAge.years} years, {result.realAge.months} months, {result.realAge.days} days
                    </p>
                    <p className="text-xs text-gray-400">Born on {fmtDate(result.dob)}</p>
                  </div>
                </div>

                {/* Suggested class */}
                {yrs < 6 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-2xl mb-1">😕</p>
                    <p className="font-bold text-red-600 text-base">Too Young for Admission</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Age on April 1:
                    </p>
                    <p className="inline-block mt-1 bg-red-100 text-red-600 font-bold rounded-full px-4 py-1 text-sm">
                      {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Minimum age for Class 1 is 6 years.</p>
                  </div>
                ) : yrs > 13 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-2xl mb-1">📋</p>
                    <p className="font-bold text-yellow-700 text-base">Too Old for Class 1–8</p>
                    <p className="text-sm text-gray-600 mt-2">Age on April 1:</p>
                    <p className="inline-block mt-1 bg-yellow-100 text-yellow-700 font-bold rounded-full px-4 py-1 text-sm">
                      {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Please check Class 9 and above admission.</p>
                  </div>
                ) : (
                  <div className="bg-orange-600 rounded-lg p-5 text-white text-center">
                    <p className="text-sm text-orange-200 mb-1">Suggested Class for This Student</p>
                    <p className="text-5xl font-extrabold mb-3">Class {result.suggestedClass}</p>
                    <p className="text-orange-200 text-xs mb-1">Age on April 1</p>
                    <span className="inline-block bg-white text-orange-600 font-bold rounded-full px-4 py-1 text-sm">
                      {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                    </span>
                  </div>
                )}
              </div>

              {/* Class picker card */}
              {result.suggestedClass && (
                <div className="bg-white rounded-lg shadow-md p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Want to check a different class?</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Tap a class to see if this student is eligible for it.
                    <span className="text-orange-500 font-bold"> ★</span> = suggested class
                  </p>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(c => {
                      const isActive    = selectedClass === c;
                      const isSuggested = result.suggestedClass === c;
                      return (
                        <button
                          key={c}
                          onClick={() => setSelectedClass(c)}
                          className={`relative rounded-lg py-3 text-sm font-bold border transition-all ${
                            isActive
                              ? "bg-orange-600 text-white border-orange-600 shadow"
                              : "bg-orange-50 text-gray-700 border-orange-200 hover:bg-orange-100 hover:border-orange-400"
                          }`}
                        >
                          {isSuggested && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-orange-400 text-white text-[8px] font-black flex items-center justify-center">★</span>
                          )}
                          Class {c}
                          <span className={`block text-[10px] font-normal mt-0.5 ${isActive ? "text-orange-200" : "text-gray-400"}`}>
                            Age {c + 5}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Simple plain-English result for selected class */}
                  {selectedClass && (() => {
                    const requiredAge = selectedClass + 5;
                    const range = dobRangeForClass(selectedClass, cutoffYear);
                    const d = new Date(result.dob.getFullYear(), result.dob.getMonth(), result.dob.getDate());
                    const match = d >= new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate())
                               && d <= new Date(range.to.getFullYear(),   range.to.getMonth(),   range.to.getDate());

                    return (
                      <div className={`rounded-lg p-4 border ${match ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                        {match ? (
                          <>
                            <p className="text-green-700 font-bold text-base mb-2">✓ Yes, eligible for Class {selectedClass}</p>
                            <p className="text-sm text-gray-600 mb-1">Age on April 1:</p>
                            <span className="inline-block bg-green-100 text-green-700 font-bold rounded-full px-4 py-1 text-sm">
                              {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                            </span>
                            <p className="text-xs text-gray-500 mt-2">Exactly what Class {selectedClass} needs ✓</p>
                          </>
                        ) : (
                          <>
                            <p className="text-red-600 font-bold text-base mb-2">✗ Not eligible for Class {selectedClass}</p>
                            <p className="text-sm text-gray-600 mb-1">This student&apos;s age on April 1:</p>
                            <span className="inline-block bg-red-100 text-red-600 font-bold rounded-full px-4 py-1 text-sm">
                              {yrs} yrs &nbsp;{result.cutoffAge.months} mo &nbsp;{result.cutoffAge.days} days
                            </span>
                            <p className="text-sm text-gray-600 mt-2">
                              Class {selectedClass} needs <strong>{requiredAge} years</strong> — right class is{" "}
                              <strong className="text-orange-600">Class {result.suggestedClass}</strong>.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              For Class {selectedClass}, student must be born between{" "}
                              <strong>{fmtDate(range.from)}</strong> and <strong>{fmtDate(range.to)}</strong>.
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
