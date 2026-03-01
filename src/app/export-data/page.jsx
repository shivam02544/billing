"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { DownloadCloud, FileSpreadsheet, AlertCircle } from "lucide-react";

export default function ExportDataPage() {
  const [isExporting, setIsExporting] = useState(false);

  const convertToCSV = (objArray) => {
    if (!objArray || !objArray.length) return "";
    
    // Extract headers
    const headers = Object.keys(objArray[0]);
    
    // Create CSV rows
    const csvRows = [];
    csvRows.push(headers.join(",")); // Header row
    
    for (const row of objArray) {
      const values = headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? "" : String(row[header]);
        // Escape quotes and stringify fields containing commas
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }
    
    return csvRows.join("\n");
  };

  const handleExport = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading("Preparing your database export...");
    
    try {
      const res = await fetch("/api/export-data");
      const result = await res.json();
      
      if (result.status === 200 && result.data && result.data.length > 0) {
        const csvData = convertToCSV(result.data);
        
        // Create Blob and prompt download
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        
        const date = new Date().toISOString().split('T')[0];
        const session = localStorage.getItem("currentSession") || "current";
        link.setAttribute("download", `School_Database_Export_${session}_${date}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Export downloaded successfully!", { id: loadingToast });
      } else {
        toast.error("No data found to export.", { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate export file.", { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <FileSpreadsheet className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Database Backup Tool</h1>
          <p className="text-blue-100 text-sm">
            Export all student profiles, current dues, and fee structures from the active session directly into a CSV file.
          </p>
        </div>
        
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
            <div className="flex gap-3">
              <AlertCircle className="text-yellow-600 dark:text-yellow-500 shrink-0" size={20} />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This export contains sensitive financial and personal data. Please handle the downloaded file securely.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isExporting ? (
              <span className="flex items-center gap-2 animate-pulse">
                Processing Data...
              </span>
            ) : (
              <>
                <DownloadCloud size={20} className="group-hover:-translate-y-1 transition-transform" />
                Download CSV Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
