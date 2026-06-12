"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Check, X, ShieldAlert } from "lucide-react";
import ResponsiveMenu from "@/components/ResponsiveMenu";

const fetcher = (url) => fetch(url).then((res) => res.json());

/* ─── Delete Confirmation Modal ─── */
function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn">
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4">
          <Trash2 size={26} className="text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Delete Fee?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to delete <strong className="text-gray-800">{name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ImportantFeesPage() {
  const { data, error, mutate, isLoading } = useSWR("/api/dynamic-fees", fetcher);

  const [fees, setFees] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingFee, setDeletingFee] = useState(null); // { _id, name }
  const [tempRow, setTempRow] = useState({ name: "", amount: "", description: "" });

  useEffect(() => {
    if (data && data.status === 200) setFees(data.data);
  }, [data]);

  const handleAddStart = () => {
    setIsAdding(true);
    setTempRow({ name: "", amount: "", description: "" });
    setEditingId(null);
  };

  const handleEditStart = (fee) => {
    setEditingId(fee._id);
    setTempRow({ name: fee.name, amount: fee.amount, description: fee.description || "" });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setTempRow({ name: "", amount: "", description: "" });
  };

  const handleSave = async () => {
    if (!tempRow.name || !tempRow.amount) { toast.error("Name and Amount are required."); return; }
    const payload = { name: tempRow.name, amount: Number(tempRow.amount), description: tempRow.description };
    try {
      if (isAdding) {
        const res = await fetch("/api/dynamic-fees", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.status === 201) { toast.success("Fee added successfully"); mutate(); setIsAdding(false); }
        else toast.error(result.message || "Failed to add fee");
      } else if (editingId) {
        const res = await fetch("/api/dynamic-fees", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
        const result = await res.json();
        if (result.status === 200) { toast.success("Fee updated successfully"); mutate(); setEditingId(null); }
        else toast.error(result.message || "Failed to update fee");
      }
    } catch { toast.error("An error occurred while saving."); }
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingFee) return;
    try {
      const res = await fetch(`/api/dynamic-fees?id=${deletingFee._id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.status === 200) { toast.success("Fee deleted successfully"); mutate(); }
      else toast.error(result.message || "Failed to delete fee");
    } catch { toast.error("An error occurred while deleting."); }
    finally { setDeletingFee(null); }
  };

  const totalFees = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const inlineCls = "w-full px-3 py-2 border-2 border-orange-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white";

  if (isLoading) {
    return (
      <>
        <ResponsiveMenu />
        <div className="min-h-screen bg-orange-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-orange-600 text-sm font-medium">Loading fees...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ResponsiveMenu />
        <div className="min-h-screen bg-orange-50 flex items-center justify-center">
          <p className="text-red-500 font-semibold">Failed to load fees.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {deletingFee && (
        <DeleteModal
          name={deletingFee.name}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeletingFee(null)}
        />
      )}
      <ResponsiveMenu />
      <div className="min-h-screen bg-orange-50 pb-12">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <ShieldAlert size={22} /> Fee Structure
              </h1>
              <p className="text-orange-100 text-sm mt-0.5">Manage mandatory and optional school charges</p>
            </div>
            <button
              onClick={handleAddStart}
              disabled={isAdding || !!editingId}
              className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50 text-sm self-start sm:self-auto"
            >
              <Plus size={16} /> Add New Fee
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-5">

          {/* Summary total */}
          {fees.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Fees Defined</p>
                <p className="text-xl font-extrabold text-orange-600 mt-0.5">₹{totalFees.toLocaleString()}</p>
              </div>
              <span className="text-xs bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full">
                {fees.length} fee{fees.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-orange-50 border-b border-orange-100">
                    <th className="px-5 py-3 text-xs font-bold text-orange-700 uppercase tracking-wide">Fee Name</th>
                    <th className="px-5 py-3 text-xs font-bold text-orange-700 uppercase tracking-wide">Amount</th>
                    <th className="px-5 py-3 text-xs font-bold text-orange-700 uppercase tracking-wide">Description</th>
                    <th className="px-5 py-3 text-xs font-bold text-orange-700 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">

                  {/* Add new row */}
                  {isAdding && (
                    <tr className="bg-orange-50/60">
                      <td className="px-4 py-3"><input autoFocus type="text" className={inlineCls} placeholder="e.g. Transport Fee" value={tempRow.name} onChange={(e) => setTempRow({ ...tempRow, name: e.target.value })} /></td>
                      <td className="px-4 py-3"><input type="number" className={inlineCls} placeholder="0" value={tempRow.amount} onChange={(e) => setTempRow({ ...tempRow, amount: e.target.value })} /></td>
                      <td className="px-4 py-3"><input type="text" className={inlineCls} placeholder="Optional" value={tempRow.description} onChange={(e) => setTempRow({ ...tempRow, description: e.target.value })} /></td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={handleSave} className="text-green-600 hover:text-white hover:bg-green-500 p-2 rounded-xl transition-colors mx-0.5"><Check size={16} /></button>
                        <button onClick={cancelEdit} className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-colors mx-0.5"><X size={16} /></button>
                      </td>
                    </tr>
                  )}

                  {/* Data rows */}
                  {fees.length === 0 && !isAdding ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-12 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-gray-500 font-semibold">No fees defined yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add New Fee" to get started</p>
                      </td>
                    </tr>
                  ) : (
                    fees.map((fee) => {
                      const isEditingThis = editingId === fee._id;
                      return (
                        <tr key={fee._id} className="hover:bg-orange-50 transition-colors">
                          {isEditingThis ? (
                            <>
                              <td className="px-4 py-3"><input autoFocus type="text" className={inlineCls} value={tempRow.name} onChange={(e) => setTempRow({ ...tempRow, name: e.target.value })} /></td>
                              <td className="px-4 py-3"><input type="number" className={inlineCls} value={tempRow.amount} onChange={(e) => setTempRow({ ...tempRow, amount: e.target.value })} /></td>
                              <td className="px-4 py-3"><input type="text" className={inlineCls} value={tempRow.description} onChange={(e) => setTempRow({ ...tempRow, description: e.target.value })} /></td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <button onClick={handleSave} className="text-green-600 hover:text-white hover:bg-green-500 p-2 rounded-xl transition-colors mx-0.5"><Check size={16} /></button>
                                <button onClick={cancelEdit} className="text-gray-500 hover:text-white hover:bg-gray-400 p-2 rounded-xl transition-colors mx-0.5"><X size={16} /></button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-3.5 text-gray-800 font-semibold text-sm">{fee.name}</td>
                              <td className="px-5 py-3.5">
                                <span className="font-extrabold text-orange-600 text-sm">₹{Number(fee.amount).toLocaleString()}</span>
                              </td>
                              <td className="px-5 py-3.5 text-gray-400 text-sm italic">
                                {fee.description || "—"}
                              </td>
                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleEditStart(fee)}
                                  disabled={isAdding || !!editingId}
                                  className="text-blue-500 hover:text-white hover:bg-blue-500 p-2 rounded-xl transition-colors mx-0.5 disabled:opacity-30"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => setDeletingFee(fee)}
                                  disabled={isAdding || !!editingId}
                                  className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-colors mx-0.5 disabled:opacity-30"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {/* Footer total */}
                {fees.length > 0 && (
                  <tfoot>
                    <tr className="bg-orange-50 border-t-2 border-orange-200">
                      <td className="px-5 py-3 text-xs font-extrabold text-orange-700 uppercase">Total</td>
                      <td className="px-5 py-3 text-sm font-extrabold text-orange-700">₹{totalFees.toLocaleString()}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
