"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Upload,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  File,
  Eye,
  Trash2,
  Download,
  X,
  CloudUpload,
  AlertCircle,
  FileArchive,
  FileSpreadsheet,
  FileType,
  Loader2,
} from "lucide-react";

/* ─── Utility: human-readable file size ───────────────────── */
function formatSize(bytes) {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Utility: format date ────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ─── File type icon + color ──────────────────────────────── */
function getFileIcon(mimeType = "") {
  if (mimeType.startsWith("image/")) return { Icon: ImageIcon, color: "text-purple-500", bg: "bg-purple-50" };
  if (mimeType === "application/pdf") return { Icon: FileType, color: "text-red-500", bg: "bg-red-50" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return { Icon: FileSpreadsheet, color: "text-green-600", bg: "bg-green-50" };
  if (mimeType.includes("word") || mimeType.includes("document"))
    return { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z"))
    return { Icon: FileArchive, color: "text-yellow-600", bg: "bg-yellow-50" };
  return { Icon: File, color: "text-gray-500", bg: "bg-gray-50" };
}

/* ─── Preview Modal ────────────────────────────────────────── */
function PreviewModal({ file, onClose }) {
  const isImage = file.mimeType?.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";
  const canEmbed = isImage || isPdf;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col animate-scaleIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {(() => {
              const { Icon, color } = getFileIcon(file.mimeType);
              return <Icon size={18} className={color} />;
            })()}
            <span className="font-semibold text-gray-800 text-sm truncate">{file.name}</span>
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            <a
              href={file.viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Eye size={13} /> Open in Drive
            </a>
            <a
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Download size={13} /> Download
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {canEmbed ? (
            isImage ? (
              <div className="flex items-center justify-center h-full p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.previewUrl.replace("/preview", "/uc?export=view")}
                  alt={file.name}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <iframe
                src={file.previewUrl}
                className="w-full h-full border-0"
                title={file.name}
                allow="autoplay"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 py-16">
              {(() => {
                const { Icon, color, bg } = getFileIcon(file.mimeType);
                return (
                  <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center`}>
                    <Icon size={32} className={color} />
                  </div>
                );
              })()}
              <div className="text-center">
                <p className="font-semibold text-gray-700 mb-1">Preview not available</p>
                <p className="text-sm text-gray-400">This file type cannot be previewed here.</p>
              </div>
              <a
                href={file.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Eye size={15} /> Open in Google Drive
              </a>
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
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <><Trash2 size={14} /> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Upload Drop Zone ─────────────────────────────────────── */
function UploadZone({ onFilesSelected, uploading }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (uploading) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected, uploading]
  );

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none ${
        isDragging
          ? "border-orange-500 bg-orange-50 scale-[1.01]"
          : uploading
          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70"
          : "border-orange-200 hover:border-orange-400 hover:bg-orange-50/60"
      }`}
    >
      {uploading ? (
        <>
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Loader2 size={24} className="text-orange-600 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-orange-600">Uploading to Google Drive…</p>
          <p className="text-xs text-gray-400">Please wait</p>
        </>
      ) : (
        <>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDragging ? "bg-orange-200" : "bg-orange-100"}`}>
            <CloudUpload size={24} className={`transition-colors ${isDragging ? "text-orange-700" : "text-orange-600"}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              Drop files here or{" "}
              <span className="text-orange-600 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">All file types accepted • No size limit</p>
          </div>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) onFilesSelected(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ─── File Row ─────────────────────────────────────────────── */
function FileRow({ file, onPreview, onDelete }) {
  const { Icon, color, bg } = getFileIcon(file.mimeType);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50/60 transition-colors group border border-transparent hover:border-orange-100">
      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon size={18} className={color} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatSize(file.size)} · {formatDate(file.createdTime)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onPreview(file)}
          title="Preview"
          className="p-2 rounded-lg hover:bg-orange-100 text-orange-600 transition-colors"
        >
          <Eye size={15} />
        </button>
        <a
          href={file.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Download"
          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
        >
          <Download size={15} />
        </a>
        <button
          onClick={() => onDelete(file)}
          title="Delete"
          className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Always-visible actions for touch/mobile */}
      <div className="flex items-center gap-1.5 group-hover:hidden shrink-0 md:flex md:group-hover:hidden">
        <button
          onClick={() => onPreview(file)}
          className="md:hidden p-2 rounded-lg hover:bg-orange-100 text-orange-600 transition-colors"
        >
          <Eye size={15} />
        </button>
        <button
          onClick={() => onDelete(file)}
          className="md:hidden p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────── */
const StudentFilesSection = ({ pageId, studentName }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── Fetch files ──────────────────────────────────────────── */
  const fetchFiles = useCallback(async () => {
    if (!pageId || !studentName) return;
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/student-files?pageId=${encodeURIComponent(pageId)}&studentName=${encodeURIComponent(studentName)}`
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        setFiles(data.data || []);
      } else {
        toast.error(data.message || "Failed to load files");
      }
    } catch {
      toast.error("Error loading student files");
    } finally {
      setIsLoading(false);
    }
  }, [pageId, studentName]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  /* ── Upload ───────────────────────────────────────────────── */
  const handleUpload = async (selectedFiles) => {
    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append("pageId", pageId);
        formData.append("studentName", studentName);
        formData.append("file", file);

        const res = await fetch("/api/student-files", { method: "POST", body: formData });
        const data = await res.json();

        if (data.statusCode === 200) {
          successCount++;
          setFiles((prev) => [data.data, ...prev]);
        } else {
          failCount++;
          toast.error(`Failed to upload "${file.name}": ${data.message}`);
        }
      } catch {
        failCount++;
        toast.error(`Error uploading "${file.name}"`);
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(
        successCount === 1
          ? "File uploaded successfully!"
          : `${successCount} files uploaded successfully!`
      );
    }
    if (failCount > 0 && successCount === 0) {
      // individual errors already shown
    }
  };

  /* ── Delete ───────────────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/student-files?fileId=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.statusCode === 200) {
        setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
        toast.success("File deleted successfully");
        setDeleteTarget(null);
      } else {
        toast.error(data.message || "Failed to delete file");
      }
    } catch {
      toast.error("Error deleting file");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* Preview Modal */}
      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteFileModal
          fileName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* ── Section Card ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Section header */}
        <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen size={14} className="text-orange-600" />
            <span className="text-xs font-bold text-orange-700 uppercase tracking-widest">
              Student Documents
            </span>
            {!isLoading && (
              <span className="text-[10px] font-bold text-orange-500 bg-orange-100 rounded-full px-2 py-0.5">
                {files.length} {files.length === 1 ? "file" : "files"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-medium">
            <Upload size={10} />
            Google Drive
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Upload zone */}
          <UploadZone onFilesSelected={handleUpload} uploading={uploading} />

          {/* File list */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 w-48 rounded" />
                    <div className="skeleton h-2.5 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-gray-400">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                <AlertCircle size={22} className="text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500">No documents yet</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Upload files using the area above
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 divide-y divide-gray-50">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onPreview={setPreviewFile}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentFilesSection;
