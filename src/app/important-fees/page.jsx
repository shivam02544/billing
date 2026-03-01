"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Check, X, ShieldAlert } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ImportantFeesPage() {
  const { data, error, mutate, isLoading } = useSWR("/api/dynamic-fees", fetcher);
  
  const [fees, setFees] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Temporary state for the row being edited or added
  const [tempRow, setTempRow] = useState({ name: "", amount: "", description: "" });

  useEffect(() => {
    if (data && data.status === 200) {
      setFees(data.data);
    }
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
    if (!tempRow.name || !tempRow.amount) {
      toast.error("Name and Amount are required.");
      return;
    }

    const payload = {
      name: tempRow.name,
      amount: Number(tempRow.amount),
      description: tempRow.description,
    };

    try {
      if (isAdding) {
        const res = await fetch("/api/dynamic-fees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.status === 201) {
          toast.success("Fee added successfully");
          mutate();
          setIsAdding(false);
        } else {
          toast.error(result.message || "Failed to add fee");
        }
      } else if (editingId) {
        const res = await fetch("/api/dynamic-fees", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
        const result = await res.json();
        if (result.status === 200) {
          toast.success("Fee updated successfully");
          mutate();
          setEditingId(null);
        } else {
          toast.error(result.message || "Failed to update fee");
        }
      }
    } catch (err) {
      toast.error("An error occurred while saving.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fee?")) {
      try {
        const res = await fetch(`/api/dynamic-fees?id=${id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.status === 200) {
          toast.success("Fee deleted successfully");
          mutate();
        } else {
          toast.error(result.message || "Failed to delete fee");
        }
      } catch (err) {
        toast.error("An error occurred while deleting.");
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading fees...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load fees.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-500 dark:text-orange-500 flex items-center gap-2">
            <ShieldAlert className="text-orange-600" size={32} />
            Important Fees Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Information about mandatory and optional school charges (e.g. Transport, Late Fines).
          </p>
        </div>

        <button
          onClick={handleAddStart}
          disabled={isAdding || editingId}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Add New Fee
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-gray-300">
                <th className="p-4 font-semibold uppercase text-xs tracking-wider">Fee Name</th>
                <th className="p-4 font-semibold uppercase text-xs tracking-wider">Amount (₹)</th>
                <th className="p-4 font-semibold uppercase text-xs tracking-wider">Description</th>
                <th className="p-4 font-semibold uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
              
              {/* Add New Row Template */}
              {isAdding && (
                <tr className="bg-blue-50/50 dark:bg-blue-900/10 transition-colors">
                  <td className="p-4">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-zinc-700 dark:border-zinc-600"
                      placeholder="e.g. Transport Fee"
                      value={tempRow.name}
                      onChange={(e) => setTempRow({ ...tempRow, name: e.target.value })}
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-zinc-700 dark:border-zinc-600"
                      placeholder="0"
                      value={tempRow.amount}
                      onChange={(e) => setTempRow({ ...tempRow, amount: e.target.value })}
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-zinc-700 dark:border-zinc-600"
                      placeholder="Optional description"
                      value={tempRow.description}
                      onChange={(e) => setTempRow({ ...tempRow, description: e.target.value })}
                    />
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={handleSave} className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors mx-1">
                      <Check size={18} />
                    </button>
                    <button onClick={cancelEdit} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors mx-1">
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {fees.length === 0 && !isAdding ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No important fees found. Click "Add New Fee" to get started.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => {
                  const isEditingThis = editingId === fee._id;

                  return (
                    <tr key={fee._id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                      {isEditingThis ? (
                        <>
                          <td className="p-4">
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-zinc-700 dark:border-zinc-600"
                              value={tempRow.name}
                              onChange={(e) => setTempRow({ ...tempRow, name: e.target.value })}
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-zinc-700 dark:border-zinc-600"
                              value={tempRow.amount}
                              onChange={(e) => setTempRow({ ...tempRow, amount: e.target.value })}
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-zinc-700 dark:border-zinc-600"
                              value={tempRow.description}
                              onChange={(e) => setTempRow({ ...tempRow, description: e.target.value })}
                            />
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button onClick={handleSave} className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors mx-1">
                              <Check size={18} />
                            </button>
                            <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors mx-1">
                              <X size={18} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 text-gray-800 dark:text-gray-200 font-medium">
                            {fee.name}
                          </td>
                          <td className="p-4 text-orange-600 dark:text-orange-400 font-bold">
                            ₹{fee.amount}
                          </td>
                          <td className="p-4 text-gray-500 text-sm">
                            {fee.description || <span className="italic opacity-50">No description</span>}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleEditStart(fee)}
                              disabled={isAdding || editingId}
                              className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors mx-1 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(fee._id)}
                              disabled={isAdding || editingId}
                              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors mx-1 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
