"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import Link from "next/link";
import { FileText, Printer, Download, CheckCircle2, IndianRupee } from "lucide-react";

const GenerateBill = () => {
  const [addExamFee,       setAddExamFee]       = useState(false);
  const [otherFee,         setOtherFee]         = useState(0);
  const [otherFeeMessage,  setOtherFeeMessage]  = useState("");
  const [loading,          setLoading]          = useState(false);
  const [generated,        setGenerated]        = useState(false);

  const handlePrint = () => {
    window.open("/studentBills", "_blank", "width=700,height=1200,top=100,left=100,noopener,noreferrer");
  };

  const handleGenerateBill = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addExamFee, otherFee, otherFeeMessage }),
      });
      if (!response.ok) { toast.error("Failed to generate bill"); return; }
      const data = await response.json();
      await fetch("/api/calculateTotalFees");
      toast.success(data.message);
      setGenerated(true);
    } catch (error) {
      console.error("Error generating bill:", error);
      alert("Failed to generate bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ResponsiveMenu />
      <div className="min-h-screen bg-orange-50 pb-12">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-6">
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <FileText size={24} /> Generate Bills
            </h1>
            <p className="text-orange-100 text-sm mt-1">Create monthly fee bills for all students</p>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 mt-6 space-y-4">

          {/* Success state */}
          {generated && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3 animate-bounceIn">
              <CheckCircle2 size={22} className="text-green-500 shrink-0" />
              <div>
                <p className="font-bold text-green-700">Bills generated successfully!</p>
                <p className="text-xs text-green-600">You can now print or download the bills below.</p>
              </div>
            </div>
          )}


          {/* Steps card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Step 1: Configure */}
            <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">Configure Bill Options</span>
            </div>
            <div className="p-5 space-y-5">

              {/* Exam fee toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-700 text-sm">Include Exam Fee</p>
                  <p className="text-xs text-gray-400 mt-0.5">Adds exam fee to each student's bill</p>
                </div>
                <button
                  type="button"
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 ${
                    addExamFee ? "bg-green-500" : "bg-gray-300"
                  }`}
                  onClick={() => setAddExamFee(!addExamFee)}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      addExamFee ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Other fee */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                  <IndianRupee size={12} /> Additional Fee (optional)
                </label>
                <div className="flex gap-2">
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      className="w-full border-2 border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="0"
                      value={otherFee}
                      onChange={(e) => setOtherFee(e.target.value)}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="Description (e.g. Computer Fee)"
                    value={otherFeeMessage}
                    onChange={(e) => setOtherFeeMessage(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Generate */}
            <div className="px-5 py-3 bg-orange-50 border-y border-orange-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">Generate Bills</span>
            </div>
            <div className="p-5">
              <button
                onClick={handleGenerateBill}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-blue-200"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <><FileText size={16} /> Generate Bills for All Students</>
                )}
              </button>
            </div>

            {/* Step 3: Print / Download */}
            <div className="px-5 py-3 bg-orange-50 border-y border-orange-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">Print or Download</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold transition-all active:scale-95 text-sm"
              >
                <Printer size={16} /> Print Bills
              </button>
              <Link
                href="/getStudentsBill"
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-semibold transition-all text-sm"
              >
                <Download size={16} /> Get New Bills
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GenerateBill;
