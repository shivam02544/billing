"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Edit2, Save, Trash2, X, User, IndianRupee } from "lucide-react";
import StudentFilesSection from "./StudentFilesSection";

const CLASSES = ["PRE-NC", "NC", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8"];

/* ─── Delete Confirmation Modal ─────────────── */
function DeleteModal({ name, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn">
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4">
          <Trash2 size={28} className="text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Delete Student?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          This will permanently delete <strong className="text-gray-800">{name}</strong> from the system. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Trash2 size={14} /> Yes, Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Info Row (read mode) ───────────────────── */
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value || <span className="text-gray-400 font-normal italic">—</span>}</span>
    </div>
  );
}

const StudentDetailPage = ({ pageId, studentName }) => {
  const [isEditing,       setIsEditing]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentId,       setStudentId]       = useState("");
  const [sPageId,         setPageId]          = useState("");
  const [name,            setName]            = useState("");
  const [className,       setClass]           = useState("");
  const [village,         setVillage]         = useState("");
  const [fatherName,      setFatherName]      = useState("");
  const [contact,         setContact]         = useState("");
  const [transport,       setTransport]       = useState(0);
  const [extraClassesFee, setExtraClassesFee] = useState(0);
  const [isLoading,       setIsLoading]       = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/studentsCrud?pageId=${pageId}&name=${studentName}`);
        if (!response.ok) throw new Error("Failed to fetch student data");
        const data = await response.json();
        if (data.statusCode === 200 && data.data) {
          const s = data.data;
          setPageId(s.pageId || "");
          setStudentId(s._id || "");
          setName(s.name || "");
          setClass(s.className || "");
          setVillage(s.village || "");
          setFatherName(s.fatherName || "");
          setContact(s.contact || "");
          setTransport(Number(s.transport || 0));
          setExtraClassesFee(Number(s.extraClassesFee || 0));
        } else {
          toast.error("Student not found");
        }
      } catch {
        toast.error("Error fetching student data");
      }
    };
    if (pageId && studentName) fetchData();
  }, [pageId, studentName]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/studentsCrud", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: sPageId, studentId,
          name: String(name || ""),
          className: String(className || ""),
          village: String(village || ""),
          fatherName: String(fatherName || ""),
          contact: String(contact || ""),
          transport: Number(transport || 0),
          extraClassesFee: Number(extraClassesFee || 0),
        }),
      });
      if (!response.ok) throw new Error("Failed to update student");
      const updateResponse = await response.json();
      if (updateResponse.statusCode === 200) {
        toast.success("Student updated successfully");
        setIsEditing(false);
      } else {
        toast.error(updateResponse.message || "Failed to update student");
      }
    } catch {
      toast.error("Error updating student details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/studentsCrud?studentId=${studentId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete student");
      const deleteResponse = await response.json();
      if (deleteResponse.statusCode === 200) {
        toast.success("Student deleted successfully");
        setShowDeleteModal(false);
        window.location.reload();
      } else {
        toast.error(deleteResponse.message || "Error deleting student");
      }
    } catch {
      toast.error("Error deleting student");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Common input props ─────────────── */
  const inputCls = "border-2 border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-orange-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed";

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          name={name}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={isLoading}
        />
      )}

      <div className="min-h-screen bg-orange-50 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-4">

          {/* Title bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">
                {name || "Student Details"}
              </h2>
              <p className="text-sm text-gray-500">Page ID: <span className="font-bold text-orange-600">#{sPageId}</span></p>
            </div>
            {studentId && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-semibold text-sm transition-colors"
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60 active:scale-95"
                    >
                      {isLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : <Save size={14} />}
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isLoading || !studentId}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>

          {!studentId ? (
            /* Loading skeleton */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="skeleton h-2.5 w-20 rounded" />
                  <div className="skeleton h-5 w-48 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Section: Personal Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                  <User size={14} className="text-orange-600" />
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-widest">Personal Information</span>
                </div>
                <div className="p-5">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Page ID</label>
                        <input className={inputCls} type="text" value={sPageId} onChange={e => setPageId(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                        <input className={inputCls} type="text" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Class</label>
                        <select className={inputCls} value={className} onChange={e => setClass(e.target.value)}>
                          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Village</label>
                        <input className={inputCls} type="text" value={village} onChange={e => setVillage(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Father's Name</label>
                        <input className={inputCls} type="text" value={fatherName} onChange={e => setFatherName(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</label>
                        <input className={inputCls} type="text" value={contact} onChange={e => setContact(e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      <InfoRow label="Page ID"       value={sPageId} />
                      <InfoRow label="Full Name"     value={name} />
                      <InfoRow label="Class"         value={className} />
                      <InfoRow label="Village"       value={village} />
                      <InfoRow label="Father's Name" value={fatherName} />
                      <InfoRow label="Contact"       value={contact} />
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Fee Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                  <IndianRupee size={14} className="text-orange-600" />
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-widest">Fee Information</span>
                </div>
                <div className="p-5">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transport Fee (₹)</label>
                        <input
                          className={inputCls} type="number" value={transport}
                          onChange={e => setTransport(Number(e.target.value || 0))}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Extra Classes Fee (₹)</label>
                        <input
                          className={inputCls} type="number" value={extraClassesFee}
                          onChange={e => setExtraClassesFee(Number(e.target.value || 0))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Transport Fee</p>
                        <p className="text-xl font-extrabold text-blue-700">₹{transport}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Extra Classes Fee</p>
                        <p className="text-xl font-extrabold text-indigo-700">₹{extraClassesFee}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Student Documents (Google Drive) */}
              <StudentFilesSection pageId={sPageId} studentName={name} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentDetailPage;
