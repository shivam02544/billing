"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import {
  CloudUpload, FolderOpen, File, FileText, Image as ImageIcon,
  FileType, FileSpreadsheet, FileArchive, Music, Video, Eye,
  Download, Trash2, X, Loader2, AlertCircle, ShieldCheck,
  Grid3X3, List, Search,
} from "lucide-react";

/* ─── Categories ───────────────────────────────────────────── */
const CATEGORIES = [
  { key: "General",    label: "General",     color: "orange" },
  { key: "Notices",    label: "Notices",     color: "blue"   },
  { key: "Reports",    label: "Reports",     color: "green"  },
  { key: "Circulars",  label: "Circulars",   color: "purple" },
  { key: "Finance",    label: "Finance",     color: "red"    },
];

/* ─── Utilities ────────────────────────────────────────────── */
function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getFileIcon(mimeType = "") {
  if (mimeType.startsWith("image/"))                                             return { Icon: ImageIcon,      color: "text-purple-500",  bg: "bg-purple-50"  };
  if (mimeType.startsWith("video/"))                                             return { Icon: Video,           color: "text-pink-500",    bg: "bg-pink-50"    };
  if (mimeType.startsWith("audio/"))                                             return { Icon: Music,           color: "text-indigo-500",  bg: "bg-indigo-50"  };
  if (mimeType === "application/pdf")                                            return { Icon: FileType,        color: "text-red-500",     bg: "bg-red-50"     };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
                                                                                 return { Icon: FileSpreadsheet, color: "text-green-600",   bg: "bg-green-50"   };
  if (mimeType.includes("word") || mimeType.includes("document"))               return { Icon: FileText,        color: "text-blue-500",    bg: "bg-blue-50"    };
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))     return { Icon: FileText,        color: "text-orange-500",  bg: "bg-orange-50"  };
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z"))
                                                                                 return { Icon: FileArchive,     color: "text-yellow-600",  bg: "bg-yellow-50"  };
  return { Icon: File, color: "text-gray-500", bg: "bg-gray-50" };
}

const NON_PREVIEWABLE = new Set([
  "application/zip","application/x-zip-compressed","application/x-rar-compressed",
  "application/x-7z-compressed","application/x-tar","application/gzip","application/octet-stream",
]);

/* ─── Preview Modal ────────────────────────────────────────── */
function PreviewModal({ file, onClose }) {
  const previewable = !NON_PREVIEWABLE.has(file.mimeType);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn px-2 py-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[96vh] flex flex-col animate-scaleIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
        {/* Body */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {previewable ? (
            <iframe src={file.previewUrl} className="w-full h-full border-0" title={file.name}
              allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-5">
              {(() => { const { Icon, color, bg } = getFileIcon(file.mimeType); return <div className={`w-20 h-20 ${bg} rounded-3xl flex items-center justify-center`}><Icon size={38} className={color} /></div>; })()}
              <div className="text-center">
                <p className="font-bold text-gray-700 text-base mb-1">Preview not available</p>
                <p className="text-sm text-gray-400">This file type cannot be previewed in the browser.</p>
              </div>
              <div className="flex gap-3">
                <a href={file.viewUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  <Eye size={15} /> Open in Drive
                </a>
                <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
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

/* ─── Delete Modal ─────────────────────────────────────────── */
function DeleteModal({ fileName, onConfirm, onCancel, loading }) {
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
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-all">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <><Trash2 size={14} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Upload Drop Zone ─────────────────────────────────────── */
function UploadZone({ onFilesSelected, uploading }) {
  const inputRef   = useRef(null);
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFilesSelected(files);
  }, [onFilesSelected, uploading]);

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none ${
        uploading ? "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
        : drag    ? "border-orange-500 bg-orange-50 scale-[1.01]"
                  : "border-orange-200 hover:border-orange-400 hover:bg-orange-50/60"
      }`}
    >
      {uploading ? (
        <>
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
            <Loader2 size={28} className="text-orange-600 animate-spin" />
          </div>
          <p className="text-base font-semibold text-orange-600">Uploading to Google Drive…</p>
          <p className="text-sm text-gray-400">Please wait</p>
        </>
      ) : (
        <>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${drag ? "bg-orange-200" : "bg-orange-100"}`}>
            <CloudUpload size={28} className={drag ? "text-orange-700" : "text-orange-600"} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-700">
              Drop files here or <span className="text-orange-600 underline underline-offset-2">browse</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">All file types accepted · No size limit</p>
          </div>
        </>
      )}
      <input ref={inputRef} type="file" multiple className="hidden"
        onChange={(e) => { const f = Array.from(e.target.files||[]); if (f.length) onFilesSelected(f); e.target.value=""; }} />
    </div>
  );
}

/* ─── File Card (Grid View) ────────────────────────────────── */
function FileCard({ file, onPreview, onDelete }) {
  const { Icon, color, bg } = getFileIcon(file.mimeType);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-orange-100 transition-all group">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon size={22} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate" title={file.name}>{file.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatSize(file.size)}</p>
        <p className="text-xs text-gray-400">{formatDate(file.createdTime)}</p>
      </div>
      <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
        <button onClick={() => onPreview(file)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold transition-colors active:scale-95">
          <Eye size={12} /> Preview
        </button>
        <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors">
          <Download size={12} /> Download
        </a>
        <button onClick={() => onDelete(file)}
          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors active:scale-95">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── File Row (List View) ─────────────────────────────────── */
function FileRow({ file, onPreview, onDelete }) {
  const { Icon, color, bg } = getFileIcon(file.mimeType);
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50/50 transition-colors group border border-transparent hover:border-orange-100">
      <div className={`shrink-0 w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon size={17} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate" title={file.name}>{file.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatSize(file.size)} · {formatDate(file.createdTime)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onPreview(file)} title="Preview"
          className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors active:scale-95">
          <Eye size={14} />
        </button>
        <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" title="Download"
          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
          <Download size={14} />
        </a>
        <button onClick={() => onDelete(file)} title="Delete"
          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors active:scale-95">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════ */
export default function AdminUploadsPage() {
  const [activeCategory, setActiveCategory]   = useState("General");
  const [files,           setFiles]           = useState([]);
  const [isLoading,       setIsLoading]       = useState(true);
  const [uploading,       setUploading]       = useState(false);
  const [previewFile,     setPreviewFile]     = useState(null);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [deleteLoading,   setDeleteLoading]   = useState(false);
  const [viewMode,        setViewMode]        = useState("grid"); // "grid" | "list"
  const [search,          setSearch]          = useState("");

  /* ── Fetch ──────────────────────────────────────────────── */
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/admin-files?category=${encodeURIComponent(activeCategory)}`);
      const data = await res.json();
      setFiles(data.statusCode === 200 ? data.data || [] : []);
      if (data.statusCode !== 200) toast.error(data.message || "Failed to load files");
    } catch { toast.error("Error loading files"); }
    finally { setIsLoading(false); }
  }, [activeCategory]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  /* ── Upload ─────────────────────────────────────────────── */
  const handleUpload = async (selectedFiles) => {
    setUploading(true);
    let ok = 0;
    for (const file of selectedFiles) {
      try {
        const fd = new FormData();
        fd.append("category", activeCategory);
        fd.append("file", file);
        const res  = await fetch("/api/admin-files", { method: "POST", body: fd });
        const data = await res.json();
        if (data.statusCode === 200) { ok++; setFiles((p) => [data.data, ...p]); }
        else toast.error(`Failed: ${file.name} — ${data.message}`);
      } catch { toast.error(`Error uploading "${file.name}"`); }
    }
    setUploading(false);
    if (ok) toast.success(ok === 1 ? "File uploaded!" : `${ok} files uploaded!`);
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`/api/admin-files?fileId=${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.statusCode === 200) { setFiles((p) => p.filter((f) => f.id !== deleteTarget.id)); toast.success("Deleted"); setDeleteTarget(null); }
      else toast.error(data.message || "Delete failed");
    } catch { toast.error("Error deleting file"); }
    finally { setDeleteLoading(false); }
  };

  /* ── Filtered list ──────────────────────────────────────── */
  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const catColor = CATEGORIES.find((c) => c.key === activeCategory)?.color || "orange";
  const totalSize = files.reduce((s, f) => s + (f.size || 0), 0);

  return (
    <>
      <ResponsiveMenu />

      {previewFile  && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      {deleteTarget && <DeleteModal fileName={deleteTarget.name} onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}

      <div className="min-h-screen bg-orange-50">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

          {/* ── Page Header ──────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-md shadow-orange-200">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">Admin Uploads</h1>
              <p className="text-sm text-gray-500">Manage and upload admin documents to Google Drive</p>
            </div>
          </div>

          {/* ── Category Tabs ─────────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setActiveCategory(key); setSearch(""); }}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === key
                    ? "bg-orange-600 text-white shadow-md shadow-orange-200"
                    : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left: Upload zone + stats ─────────────────── */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                  <FolderOpen size={14} className="text-orange-600" />
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-widest">
                    Upload to {activeCategory}
                  </span>
                </div>
                <div className="p-4">
                  <UploadZone onFilesSelected={handleUpload} uploading={uploading} />
                </div>
              </div>

              {/* Stats card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Storage Info</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Files in {activeCategory}</span>
                  <span className="text-sm font-bold text-orange-600">{files.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total size</span>
                  <span className="text-sm font-bold text-orange-600">{formatSize(totalSize)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Drive folder</span>
                  <span className="text-xs font-mono text-gray-400">ADMIN-UPLOADS/{activeCategory.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* ── Right: File list ──────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="relative flex-1 max-w-xs">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search files…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-orange-100 rounded-lg focus:outline-none focus:border-orange-400 bg-white"
                      />
                    </div>
                    {!isLoading && (
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-100 rounded-full px-2 py-0.5 shrink-0">
                        {filtered.length} {filtered.length === 1 ? "file" : "files"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-orange-200 text-orange-700" : "text-gray-400 hover:bg-orange-100"}`}>
                      <Grid3X3 size={14} />
                    </button>
                    <button onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-orange-200 text-orange-700" : "text-gray-400 hover:bg-orange-100"}`}>
                      <List size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                          <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="skeleton h-3.5 w-48 rounded" />
                            <div className="skeleton h-2.5 w-24 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-14">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <AlertCircle size={24} className="text-gray-300" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-500 text-sm">
                          {search ? "No files match your search" : `No files in ${activeCategory} yet`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {!search && "Upload files using the panel on the left"}
                        </p>
                      </div>
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filtered.map((f) => (
                        <FileCard key={f.id} file={f} onPreview={setPreviewFile} onDelete={setDeleteTarget} />
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {filtered.map((f) => (
                        <FileRow key={f.id} file={f} onPreview={setPreviewFile} onDelete={setDeleteTarget} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
