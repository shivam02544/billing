"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Upload, FolderOpen, FileText, Image as ImageIcon, File, Eye,
  Trash2, Download, X, CloudUpload, AlertCircle, FileArchive,
  FileSpreadsheet, FileType, Loader2, Music, Video, ShieldCheck,
} from "lucide-react";

/* ─── File size formatter ──────────────────────────────────── */
function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/* ─── Date formatter ───────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── MIME → icon/color mapping ───────────────────────────── */
function getFileIcon(mimeType = "") {
  if (mimeType.startsWith("image/"))                                             return { Icon: ImageIcon,      color: "text-purple-500",  bg: "bg-purple-50"  };
  if (mimeType.startsWith("video/"))                                             return { Icon: Video,           color: "text-pink-500",    bg: "bg-pink-50"    };
  if (mimeType.startsWith("audio/"))                                             return { Icon: Music,           color: "text-indigo-500",  bg: "bg-indigo-50"  };
  if (mimeType === "application/pdf")                                            return { Icon: FileType,        color: "text-red-500",     bg: "bg-red-50"     };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
                                                                                 return { Icon: FileSpreadsheet, color: "text-green-600",   bg: "bg-green-50"   };
  if (mimeType.includes("word") || mimeType.includes("document") || mimeType.includes("msword"))
                                                                                 return { Icon: FileText,        color: "text-blue-500",    bg: "bg-blue-50"    };
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))     return { Icon: FileText,        color: "text-orange-500",  bg: "bg-orange-50"  };
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z") || mimeType.includes("tar") || mimeType.includes("gzip"))
                                                                                 return { Icon: FileArchive,     color: "text-yellow-600",  bg: "bg-yellow-50"  };
  return { Icon: File, color: "text-gray-500", bg: "bg-gray-50" };
}

/* ─── Types that Google Drive cannot preview inline ────────── */
const NON_PREVIEWABLE_TYPES = new Set([
  "application/zip", "application/x-zip-compressed", "application/x-rar-compressed",
  "application/x-7z-compressed", "application/x-tar", "application/gzip",
  "application/x-gzip", "application/octet-stream",
]);

function canDrivePreview(mimeType = "") {
  return !NON_PREVIEWABLE_TYPES.has(mimeType);
}

/* ─── Preview Modal ────────────────────────────────────────── */
function PreviewModal({ file, onClose }) {
  const previewable = canDrivePreview(file.mimeType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn px-2 py-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[96vh] flex flex-col animate-scaleIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {(() => { const { Icon, color } = getFileIcon(file.mimeType); return <Icon size={17} className={color} />; })()}
            <span className="font-semibold text-gray-800 text-sm truncate max-w-xs">{file.name}</span>
            <span className="hidden sm:inline text-[10px] bg-gray-100 text-gray-400 rounded px-2 py-0.5 font-mono shrink-0">
              {formatSize(file.size)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a href={file.viewUrl} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg px-3 py-1.5 transition-colors">
              <Eye size={13} /> Open in Drive
            </a>
            <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors">
              <Download size={13} /> Download
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors ml-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          {previewable ? (
            /*
             * Google Drive's /preview URL is a universal viewer that handles:
             * PDF, Images, Videos, Audio, Word, Excel, PowerPoint,
             * Text, Code, Google Docs formats, and more.
             */
            <iframe
              src={file.previewUrl}
              className="w-full h-full border-0"
              title={file.name}
              allow="autoplay; encrypted-media"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          ) : (
            /* Archive / binary files — no preview available */
            <div className="flex flex-col items-center justify-center h-full gap-5">
              {(() => {
                const { Icon, color, bg } = getFileIcon(file.mimeType);
                return (
                  <div className={`w-20 h-20 ${bg} rounded-3xl flex items-center justify-center shadow-sm`}>
                    <Icon size={38} className={color} />
                  </div>
                );
              })()}
              <div className="text-center">
                <p className="font-bold text-gray-700 text-base mb-1">Preview not available</p>
                <p className="text-sm text-gray-400">This file type cannot be previewed in the browser.</p>
              </div>
              <div className="flex gap-3">
                <a href={file.viewUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors active:scale-95">
                  <Eye size={15} /> Open in Drive
                </a>
                <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors active:scale-95">
                  <Download size={15} /> Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirmation Modal ────────────────────────────── */
function DeleteFileModal({ fileName, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn">
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4">
          <Trash2 size={26} className="text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Delete File?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          <strong className="text-gray-800">{fileName}</strong> will be permanently deleted from Google Drive.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <><Trash2 size={14} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Upload Drop Zone ─────────────────────────────────────── */
function UploadZone({ onFilesSelected, uploading, accentColor = "orange" }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const accent = {
    orange: {
      border:    isDragging ? "border-orange-500 bg-orange-50 scale-[1.01]" : "border-orange-200 hover:border-orange-400 hover:bg-orange-50/60",
      iconBg:    isDragging ? "bg-orange-200" : "bg-orange-100",
      iconColor: isDragging ? "text-orange-700" : "text-orange-600",
      text:      "text-orange-600",
    },
    blue: {
      border:    isDragging ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/60",
      iconBg:    isDragging ? "bg-blue-200" : "bg-blue-100",
      iconColor: isDragging ? "text-blue-700" : "text-blue-600",
      text:      "text-blue-600",
    },
  }[accentColor] ?? {};

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFilesSelected(files);
  }, [onFilesSelected, uploading]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all select-none ${
        uploading ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70" : accent.border
      }`}
    >
      {uploading ? (
        <>
          <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
            <Loader2 size={22} className="text-orange-600 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-orange-600">Uploading to Google Drive…</p>
          <p className="text-xs text-gray-400">Please wait</p>
        </>
      ) : (
        <>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${accent.iconBg}`}>
            <CloudUpload size={22} className={`transition-colors ${accent.iconColor}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              Drop files here or{" "}
              <span className={`${accent.text} underline underline-offset-2`}>browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">All file types • No size limit</p>
          </div>
        </>
      )}
      <input ref={inputRef} type="file" multiple className="hidden"
        onChange={(e) => { const files = Array.from(e.target.files || []); if (files.length) onFilesSelected(files); e.target.value = ""; }} />
    </div>
  );
}

/* ─── File Row ─────────────────────────────────────────────── */
function FileRow({ file, onPreview, onDelete }) {
  const { Icon, color, bg } = getFileIcon(file.mimeType);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
      <div className={`shrink-0 w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon size={17} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate" title={file.name}>{file.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatSize(file.size)} · {formatDate(file.createdTime)}</p>
      </div>

      {/* Actions — always visible */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onPreview(file)}
          title="Preview"
          className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors active:scale-95"
        >
          <Eye size={15} />
        </button>
        <a
          href={file.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Download"
          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors active:scale-95"
        >
          <Download size={15} />
        </a>
        <button
          onClick={() => onDelete(file)}
          title="Delete"
          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors active:scale-95"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}


/* ─── Skeleton loader ──────────────────────────────────────── */
function FileSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
          <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-3.5 w-44 rounded" />
            <div className="skeleton h-2.5 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main reusable section — used for BOTH Student & Admin docs
   ═══════════════════════════════════════════════════════════ */
const StudentFilesSection = ({
  pageId,
  studentName,
  sectionKey  = "student",          // "student" | "admin"  → drives folder naming
  label       = "Student Documents",
  accentColor = "orange",           // "orange" | "blue"
  HeaderIcon  = FolderOpen,
}) => {
  const [files,         setFiles]         = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [uploading,     setUploading]     = useState(false);
  const [previewFile,   setPreviewFile]   = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const accent = accentColor === "blue"
    ? { header: "bg-blue-50 border-blue-100", icon: "text-blue-600", label: "text-blue-700", badge: "text-blue-500 bg-blue-100", meta: "text-blue-400" }
    : { header: "bg-orange-50 border-orange-100", icon: "text-orange-600", label: "text-orange-700", badge: "text-orange-500 bg-orange-100", meta: "text-orange-400" };

  /* ── Fetch ──────────────────────────────────────────────── */
  const fetchFiles = useCallback(async () => {
    if (!pageId || !studentName) return;
    try {
      setIsLoading(true);
      const res  = await fetch(`/api/student-files?pageId=${encodeURIComponent(pageId)}&studentName=${encodeURIComponent(studentName)}&sectionKey=${sectionKey}`);
      const data = await res.json();
      setFiles(data.statusCode === 200 ? data.data || [] : []);
      if (data.statusCode !== 200) toast.error(data.message || "Failed to load files");
    } catch {
      toast.error("Error loading files");
    } finally {
      setIsLoading(false);
    }
  }, [pageId, studentName, sectionKey]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  /* ── Upload ─────────────────────────────────────────────── */
  const handleUpload = async (selectedFiles) => {
    setUploading(true);
    let ok = 0;
    for (const file of selectedFiles) {
      try {
        const fd = new FormData();
        fd.append("pageId",       pageId);
        fd.append("studentName",  studentName);
        fd.append("sectionKey",   sectionKey);
        fd.append("file",         file);
        const res  = await fetch("/api/student-files", { method: "POST", body: fd });
        const data = await res.json();
        if (data.statusCode === 200) { ok++; setFiles((p) => [data.data, ...p]); }
        else toast.error(`Failed: ${file.name} — ${data.message}`);
      } catch { toast.error(`Error uploading "${file.name}"`); }
    }
    setUploading(false);
    if (ok > 0) toast.success(ok === 1 ? "File uploaded!" : `${ok} files uploaded!`);
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`/api/student-files?fileId=${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.statusCode === 200) {
        setFiles((p) => p.filter((f) => f.id !== deleteTarget.id));
        toast.success("File deleted");
        setDeleteTarget(null);
      } else toast.error(data.message || "Delete failed");
    } catch { toast.error("Error deleting file"); }
    finally { setDeleteLoading(false); }
  };

  return (
    <>
      {previewFile  && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      {deleteTarget && (
        <DeleteFileModal fileName={deleteTarget.name} onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-3 ${accent.header} border-b flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <HeaderIcon size={14} className={accent.icon} />
            <span className={`text-xs font-bold ${accent.label} uppercase tracking-widest`}>{label}</span>
            {!isLoading && (
              <span className={`text-[10px] font-bold ${accent.badge} rounded-full px-2 py-0.5`}>
                {files.length} {files.length === 1 ? "file" : "files"}
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1 text-[10px] ${accent.meta} font-medium`}>
            <Upload size={10} /> Google Drive
          </div>
        </div>

        <div className="p-5 space-y-4">
          <UploadZone onFilesSelected={handleUpload} uploading={uploading} accentColor={accentColor} />

          {isLoading ? <FileSkeleton /> : files.length === 0 ? (
            <div className="flex flex-col items-center gap-2.5 py-8 text-gray-400">
              <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} className="text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500">No documents yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Upload files using the area above</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {files.map((file) => (
                <FileRow key={file.id} file={file} onPreview={setPreviewFile} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentFilesSection;
