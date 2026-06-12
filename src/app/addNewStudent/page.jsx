"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import { UserPlus, Users, IndianRupee } from "lucide-react";


const CLASSES = ["PRE-NC", "NC", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8"];

const InputField = ({ label, name, type, value, onChange, onBlur, required, hidden, disabled }) => {
  if (hidden) return null;
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        required={required}
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-orange-500 focus:shadow-sm transition-all disabled:bg-gray-50 disabled:cursor-not-allowed placeholder-gray-300"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
};

const Page = () => {
  const [pageId,          setPageId]          = useState("");
  const [isYearllyFee,    setYearlyFee]       = useState(false);
  const [name,            setName]            = useState("");
  const [className,       setClass]           = useState("PRE-NC");
  const [village,         setVillage]         = useState("");
  const [fatherName,      setFatherName]      = useState("");
  const [contact,         setContact]         = useState("");
  const [transport,       setTransport]       = useState("");
  const [dueFee,          setDueFee]          = useState("0");
  const [isLoading,       setIsLoading]       = useState(false);
  const [isSiblings,      setIsSiblings]      = useState(false);
  const [extraClassesFee, setExtraClassesFee] = useState("");
  const [submitted,       setSubmitted]       = useState(false);

  const getUserDetail = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/studentsData?pageId=${id}`);
      const data = await response.json();
      if (data.status === 200) {
        setIsSiblings(true);
        setVillage(data.data[0].village);
        setFatherName(data.data[0].fatherName);
        setContact(data.data[0].contact);
        setTransport(data.data[0].transport);
      } else {
        setName(""); setClass("PRE-NC"); setVillage("");
        setFatherName(""); setContact(""); setTransport(""); setDueFee("0");
        setIsSiblings(false);
      }
    } catch {
      toast.error("Failed to fetch student detail. Please try again.");
    }
  };

  const handleFormChange = () => {
    if (isYearllyFee) {
      setDueFee("0"); setExtraClassesFee("0"); setTransport("0");
    } else {
      setDueFee(""); setExtraClassesFee(""); setTransport("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const studentData = {
      pageId, name, className, village, fatherName, contact,
      transport, dueFee, extraClassesFee, isYearllyFee,
      session: localStorage.getItem("currentSession") || "2026-2027",
    };
    try {
      const response = await fetch("/api/studentsData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      const data = await response.json();
      if (data.status === 201) {
        toast.success(data.message);
        setSubmitted(true);
        setPageId(""); setName(""); setClass("PRE-NC"); setVillage("");
        setFatherName(""); setContact(""); setTransport(""); setDueFee("");
        setIsSiblings(false); setExtraClassesFee(""); setYearlyFee(false);
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to add student. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ResponsiveMenu />
      <div className="min-h-screen bg-orange-50 pb-12">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <UserPlus size={24} /> Add New Student
            </h1>
            <p className="text-orange-100 text-sm mt-1">Register a new student for the current session</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">

          {/* Success state */}
          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3 animate-bounceIn">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-bold text-green-700">Student added successfully!</p>
                <p className="text-xs text-green-600">The form has been cleared and is ready for the next entry.</p>
              </div>
            </div>
          )}

          {/* Sibling detection banner */}
          {isSiblings && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-3 animate-slideDown">
              <Users size={18} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-700">Sibling Detected</p>
                <p className="text-xs text-blue-600">Father's name, village & contact auto-filled from existing family record.</p>
              </div>
            </div>
          )}

          {/* Fee type toggle */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-700 text-sm">Yearly Student</p>
              <p className="text-xs text-gray-400 mt-0.5">Toggle ON to add a student with pre-paid yearly fees</p>
            </div>
            <button
              type="button"
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 ${
                isYearllyFee ? "bg-green-500" : "bg-gray-300"
              }`}
              onClick={() => { setYearlyFee(!isYearllyFee); handleFormChange(); }}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  isYearllyFee ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Section: Basic Info */}
            <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
              <Users size={15} className="text-orange-600" />
              <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">Basic Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              <div className="flex flex-col">
                <label htmlFor="pageId" className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Page ID <span className="text-red-400">*</span>
                  <span className="ml-1 text-gray-400 normal-case font-normal">(blur to auto-fill siblings)</span>
                </label>
                <input
                  required
                  type="text"
                  id="pageId"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  onBlur={() => getUserDetail(pageId)}
                  className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-orange-500 transition-all"
                  placeholder="e.g. A001"
                />
              </div>
              <InputField label="Full Name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />

              <div className="flex flex-col">
                <label htmlFor="className" className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Class <span className="text-red-400">*</span>
                </label>
                <select
                  id="className"
                  value={className}
                  onChange={(e) => setClass(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-orange-500 transition-all"
                >
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <InputField label="Village" name="village" type="text" value={village} onChange={(e) => setVillage(e.target.value)} required />
              <InputField label="Father's Name" name="fatherName" type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
              <InputField label="Contact Number" name="contact" type="text" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>

            {/* Section: Fee Info */}
            <div className="px-5 py-3 bg-orange-50 border-y border-orange-100 flex items-center gap-2">
              <IndianRupee size={15} className="text-orange-600" />
              <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">Fee Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              <InputField
                label="Transport Fee (₹)" name="transport" type="number"
                value={transport} onChange={(e) => setTransport(e.target.value)}
                hidden={isYearllyFee}
              />
              <InputField
                label="Extra Classes Fee (₹)" name="extraClassesFee" type="number"
                value={extraClassesFee} onChange={(e) => setExtraClassesFee(e.target.value)}
                hidden={isYearllyFee}
              />
              {!isSiblings && (
                <InputField
                  label="Due Fee (₹)" name="dueFee" type="number"
                  value={dueFee} onChange={(e) => setDueFee(e.target.value)}
                  hidden={isYearllyFee}
                />
              )}

            </div>

            {/* Submit */}
            <div className="px-5 pb-5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-orange-200"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Student...
                  </>
                ) : (
                  <><UserPlus size={17} /> Add Student</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Page;
