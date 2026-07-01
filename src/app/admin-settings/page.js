"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import toast from "react-hot-toast";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import { DEFAULT_BILL_LAYOUT, PRESETS } from "@/helper/billLayout";
import {
  Settings, ToggleLeft, ToggleRight, Palette, FileText, QrCode,
  Bell, Shield, RefreshCw, RotateCcw, Save, ChevronRight,
  Eye, EyeOff, Smartphone, Download, MessageSquare, Zap,
  School, Phone, Mail, MapPin, LayoutDashboard, Printer,
  Moon, Sun, Minimize2, Maximize2, Clock, Lock, Unlock,
  Check, X, Info, AlertTriangle, Wifi, Database, Layers,
  AlignLeft, AlignCenter, AlignRight, Type, Square
} from "lucide-react";

/* ─── Theme palettes ──────────────────────────────────────────── */
const THEMES = [
  {
    id: "orange", label: "Orange Flame", primary: "#ea580c",
    gradient: "from-orange-600 to-orange-500",
    preview: ["bg-orange-600", "bg-orange-400", "bg-orange-100"],
  },
  {
    id: "blue", label: "Ocean Blue", primary: "#2563eb",
    gradient: "from-blue-600 to-blue-500",
    preview: ["bg-blue-600", "bg-blue-400", "bg-blue-100"],
  },
  {
    id: "green", label: "Forest Green", primary: "#16a34a",
    gradient: "from-green-600 to-green-500",
    preview: ["bg-green-600", "bg-green-400", "bg-green-100"],
  },
  {
    id: "purple", label: "Royal Purple", primary: "#7c3aed",
    gradient: "from-purple-600 to-purple-500",
    preview: ["bg-purple-600", "bg-purple-400", "bg-purple-100"],
  },
  {
    id: "rose", label: "Rose Garden", primary: "#e11d48",
    gradient: "from-rose-600 to-rose-500",
    preview: ["bg-rose-600", "bg-rose-400", "bg-rose-100"],
  },
  {
    id: "teal", label: "Deep Teal", primary: "#0d9488",
    gradient: "from-teal-600 to-teal-500",
    preview: ["bg-teal-600", "bg-teal-400", "bg-teal-100"],
  },
  {
    id: "indigo", label: "Midnight Indigo", primary: "#4f46e5",
    gradient: "from-indigo-600 to-indigo-500",
    preview: ["bg-indigo-600", "bg-indigo-400", "bg-indigo-100"],
  },
  {
    id: "amber", label: "Golden Amber", primary: "#d97706",
    gradient: "from-amber-600 to-amber-500",
    preview: ["bg-amber-600", "bg-amber-400", "bg-amber-100"],
  },
];

/* ─── Toggle component ───────────────────────────────────────── */
function Toggle({ value, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 ${
        value ? "bg-orange-500" : "bg-gray-200"
      }`}
      aria-checked={value}
      role="switch"
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─── Setting Row ─────────────────────────────────────────────── */
function SettingRow({ icon: Icon, label, description, children, badge }) {
  return (
    <div className="flex items-center justify-between py-4 px-5 hover:bg-orange-50/50 transition-colors rounded-xl">
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
            <Icon size={15} className="text-orange-600" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge.color}`}>
                {badge.text}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ─── Section Card ────────────────────────────────────────────── */
function Section({ id, title, icon: Icon, iconBg, children, badge }) {
  return (
    <div id={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`px-5 py-3.5 border-b border-gray-100 flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 ${iconBg || "bg-orange-100"} rounded-lg flex items-center justify-center`}>
            <Icon size={16} className="text-orange-600" />
          </div>
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">{title}</h2>
        </div>
        {badge && (
          <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

/* ─── NavPill ─────────────────────────────────────────────────── */
function NavPill({ label, icon: Icon, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
        active
          ? "bg-orange-600 text-white shadow-sm"
          : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════ */
const DEFAULT_SETTINGS = {
  showQrInBill: true,
  showSchoolLogoInBill: true,
  showStudentPhotoInBill: false,
  billWatermark: false,
  billWatermarkText: "NPPS",
  billFooterText: "New Progressive Public School, Nauroo, Jehanabad, Bihar",
  billHeaderColor: "#ea580c",
  billAccentColor: "#fb923c",
  showDueAmountBold: true,
  showPaymentHistory: true,
  billCopies: 1,
  appTheme: "orange",
  darkMode: false,
  compactMode: false,
  animationsEnabled: true,
  sidebarStyle: "sticky",
  enableSMS: true,
  enablePDFDownload: true,
  enableWhatsApp: true,
  enableUpiQr: true,
  enableAgeCalculator: true,
  enableExportData: true,
  enableAnnouncements: true,
  enableDefaultersAlert: true,
  enableSessionSwitch: true,
  schoolName: "NEW PROGRESSIVE PUBLIC SCHOOL",
  schoolAddress: "Nauroo, Jehanabad, Bihar",
  schoolPhone: "",
  schoolEmail: "",
  schoolUpiId: "",
  autoRefreshDashboard: false,
  autoRefreshInterval: 30,
  lowDueAlert: true,
  lowDueThreshold: 500,
  pdfFontSize: 11,
  pdfColorScheme: "orange",
  pdfIncludeQr: true,
  pdfIncludeSchoolAddress: true,
  pdfIncludeSignatureLine: true,
  pdfPageSize: "A4",
  requirePasswordForRevenue: true,
};


/* ─── Figma Designer Component ────────────────────────────────── */
const MOCK_BILL = {
  name: "ARYAN KUMAR",
  className: "LKG",
  parent: "SRI RAMJI PRASAD",
  village: "DARWARI BIGHA",
  tuitionFee: 400,
  transportFee: 300,
  examFee: 0,
  lastMonthDue: 1375,
  otherFee: 0,
  paidAmount: 0,
  totalDue: 2075,
  pageId: "A78",
  billGeneratedMonth: 6, // July
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function FigmaDesigner({ settings, update }) {
  const layout = settings.customBillLayout || DEFAULT_BILL_LAYOUT;
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const canvasRef = useRef(null);

  const selectedEl = layout.find((item) => item.id === selectedId);

  // Update a single element attribute in the customBillLayout array
  const updateElement = useCallback((id, key, value) => {
    const updatedLayout = layout.map((item) => {
      if (item.id === id) {
        return { ...item, [key]: value };
      }
      return item;
    });
    update("customBillLayout", updatedLayout);
  }, [layout, update]);

  // Apply a preset layout
  const handleApplyPreset = (key) => {
    if (confirm(`Apply the "${key}" layout preset? This will overwrite your current designer layout.`)) {
      update("customBillLayout", PRESETS[key]);
      setSelectedId(null);
      toast.success(`${key} layout applied!`);
    }
  };

  // Drag element handler
  const handleElementMouseDown = (e, el) => {
    if (e.target.closest("[data-resize-handle]")) return; // skip if resizing
    e.preventDefault();
    setSelectedId(el.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialLeft = el.left;
    const initialTop = el.top;
    const bw = settings.billWidth || 400;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Constrain position within canvas width
      const maxLeft = bw - el.width;
      const nextLeft = Math.max(0, Math.min(maxLeft, initialLeft + deltaX));
      const nextTop = Math.max(0, initialTop + deltaY);

      updateElement(el.id, "left", nextLeft);
      updateElement(el.id, "top", nextTop);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Resize element handler
  const handleResizeMouseDown = (e, el, handle) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = el.width;
    const initialHeight = el.height;
    const initialLeft = el.left;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let nextWidth = initialWidth;
      let nextHeight = initialHeight;

      if (handle === "right" || handle === "bottom-right") {
        const maxW = (settings.billWidth || 400) - initialLeft;
        nextWidth = Math.max(30, Math.min(maxW, initialWidth + deltaX));
      }
      if (handle === "bottom" || handle === "bottom-right") {
        nextHeight = Math.max(12, initialHeight + deltaY);
      }

      updateElement(el.id, "width", nextWidth);
      updateElement(el.id, "height", nextHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedId) return;

      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;
      let shouldPrevent = false;

      if (e.key === "ArrowLeft") { dx = -step; shouldPrevent = true; }
      else if (e.key === "ArrowRight") { dx = step; shouldPrevent = true; }
      else if (e.key === "ArrowUp") { dy = -step; shouldPrevent = true; }
      else if (e.key === "ArrowDown") { dy = step; shouldPrevent = true; }
      else if (e.key === "Delete" || e.key === "Backspace") {
        updateElement(selectedId, "visible", false);
        setSelectedId(null);
        shouldPrevent = true;
      } else if (e.key === "Escape") {
        setSelectedId(null);
        shouldPrevent = true;
      }

      if (dx !== 0 || dy !== 0) {
        const el = layout.find((item) => item.id === selectedId);
        if (el) {
          const bw = settings.billWidth || 400;
          const maxLeft = bw - el.width;
          const nextLeft = Math.max(0, Math.min(maxLeft, el.left + dx));
          const nextTop = Math.max(0, el.top + dy);
          updateElement(selectedId, "left", nextLeft);
          updateElement(selectedId, "top", nextTop);
        }
      }

      if (shouldPrevent) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, layout, updateElement]);

  const billWidth = settings.billWidth || 400;
  const billHeight = settings.billHeight || 0;
  const autoHeight = Math.max(...layout.filter(el => el.visible !== false).map(el => el.top + el.height), 440) + 20;
  const canvasHeight = billHeight > 0 ? billHeight : autoHeight;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      
      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className="px-5 py-4 bg-orange-50/50 border-b border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5 uppercase tracking-wide">
            <Layers size={15} className="text-orange-600 animate-pulse" /> Figma Bill Designer
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Drag to move, resize corner handles, or tweak in inspector.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bill Size Controls */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">W</span>
            <input
              type="number"
              value={billWidth}
              onChange={(e) => update("billWidth", Math.max(200, Math.min(800, Number(e.target.value))))}
              className="w-14 bg-gray-50 border border-gray-200 rounded-md px-1.5 py-0.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-orange-400 text-center"
            />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">H</span>
            <input
              type="number"
              value={billHeight || ''}
              placeholder="auto"
              onChange={(e) => update("billHeight", e.target.value ? Math.max(0, Number(e.target.value)) : 0)}
              className="w-14 bg-gray-50 border border-gray-200 rounded-md px-1.5 py-0.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-orange-400 text-center"
            />
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Presets:</span>
          {Object.keys(PRESETS).map((key) => (
            <button
              key={key}
              onClick={() => handleApplyPreset(key)}
              className="text-xs font-bold bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl px-3 py-1.5 transition-all shadow-sm capitalize"
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-gray-100 min-h-[500px]">
        
        {/* ── Left Sidebar: Layers ──────────────────────────────── */}
        <div className="xl:w-56 p-4 shrink-0 flex flex-col bg-gray-50/40">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Layers</p>
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[480px] xl:max-h-[600px] pr-1">
            {layout.map((el) => {
              const Icon = el.id === "qrCode" ? QrCode : el.id.endsWith("Box") ? Square : Type;
              const isSelected = selectedId === el.id;
              return (
                <div
                  key={el.id}
                  onMouseEnter={() => setHoveredId(el.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId(el.id)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon size={12} className={isSelected ? "text-white" : "text-gray-400"} />
                    <span className="truncate">{el.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(el.id, "visible", !el.visible);
                      }}
                      className={`p-1 rounded transition-colors ${
                        isSelected
                          ? "hover:bg-orange-700 text-white"
                          : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {el.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center: Canvas ────────────────────────────────────── */}
        <div className="flex-1 p-6 flex justify-center items-start bg-gray-50 overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div
            ref={canvasRef}
            tabIndex={0}
            className="relative bg-white shadow-xl rounded-sm border border-gray-300 select-none shrink-0"
            style={{ width: `${billWidth}px`, height: `${canvasHeight}px` }}
            onClick={() => setSelectedId(null)}
          >
            {layout.map((el) => {
              if (el.visible === false) return null;

              let content = null;
              switch (el.id) {
                case "headerText":
                  content = el.text || "Bill Payment Receipt";
                  break;
                case "headerDate":
                  content = `On ${MONTHS[MOCK_BILL.billGeneratedMonth]}`;
                  break;
                case "schoolName":
                  content = el.text || settings.schoolName || "NEW PROGRESSIVE PUBLIC SCHOOL";
                  break;
                case "schoolAddress":
                  content = el.text || settings.schoolAddress || "Nauroo, Jehanabad";
                  break;
                case "studentName":
                  content = `NAME: ${MOCK_BILL.name}`;
                  break;
                case "studentClass":
                  content = `CLASS: ${MOCK_BILL.className}`;
                  break;
                case "studentParent":
                  content = `PARENT: ${MOCK_BILL.parent}`;
                  break;
                case "studentAddress":
                  content = (
                    <div className="leading-tight text-left">
                      <span>ADDRESS:</span>
                      <span className="block truncate">{MOCK_BILL.village}</span>
                    </div>
                  );
                  break;
                case "feesList":
                  content = (
                    <div className="flex flex-col gap-1 w-full text-xs">
                      <div className="flex justify-between"><span>SCHOOL FEE:</span><span>₹{MOCK_BILL.tuitionFee}</span></div>
                      <div className="flex justify-between"><span>TRANSPORT FEE:</span><span>₹{MOCK_BILL.transportFee}</span></div>
                      <div className="flex justify-between"><span>PREVIOUS DUES:</span><span>₹{MOCK_BILL.lastMonthDue}</span></div>
                    </div>
                  );
                  break;
                case "qrCode":
                  content = (
                    <div className="flex flex-col items-center justify-center w-full h-full text-[9px] text-gray-400">
                      <QrCode size={el.width - 40} className="text-gray-700" />
                      <span className="mt-1">Scan to Pay via UPI</span>
                    </div>
                  );
                  break;
                case "dividerLine":
                  content = el.text || "--------------------------------------------------------";
                  break;
                case "totalDues":
                  content = (
                    <div className="flex justify-between w-full font-bold">
                      <span>TOTAL DUES:</span>
                      <span>₹{MOCK_BILL.totalDue}</span>
                    </div>
                  );
                  break;
                case "notesBox":
                  content = (
                    <div className="flex flex-col leading-tight text-[9px] p-1 font-normal w-full text-left">
                      {(el.text || "").split("\n").map((line, i) => (
                        <span key={i} className="truncate">{line}</span>
                      ))}
                    </div>
                  );
                  break;
                case "pageId":
                  content = MOCK_BILL.pageId;
                  break;
              }

              const isBox = el.id === "schoolBox" || el.id === "studentBox" || el.id === "notesBox";
              const isSelected = selectedId === el.id;
              const isHovered = hoveredId === el.id;

              if (isBox && el.id !== "notesBox") {
                return (
                  <div
                    key={el.id}
                    onMouseEnter={() => setHoveredId(el.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onMouseDown={(e) => handleElementMouseDown(e, el)}
                    className="absolute transition-shadow"
                    style={{
                      left: `${el.left}px`,
                      top: `${el.top}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                      border: el.border ? "1px solid black" : "none",
                      outline: isSelected ? "2px solid #ea580c" : isHovered ? "1px dashed #ea580c" : "none",
                      outlineOffset: "1px",
                      cursor: "move",
                    }}
                  >
                    {/* Corner resize handle */}
                    {isSelected && (
                      <div
                        data-resize-handle="bottom-right"
                        onMouseDown={(e) => handleResizeMouseDown(e, el, "bottom-right")}
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-orange-600 border border-white rounded-full z-20 shadow-sm cursor-nwse-resize transform translate-x-1 translate-y-1"
                      />
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={el.id}
                  onMouseEnter={() => setHoveredId(el.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onMouseDown={(e) => handleElementMouseDown(e, el)}
                  className="absolute flex items-start overflow-hidden leading-snug"
                  style={{
                    left: `${el.left}px`,
                    top: `${el.top}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    fontSize: `${el.fontSize || 12}px`,
                    fontWeight: el.fontWeight || "normal",
                    color: el.color || "#000000",
                    textAlign: el.align || "left",
                    border: isBox && el.border ? "1px solid black" : "none",
                    outline: isSelected ? "2px solid #ea580c" : isHovered ? "1px dashed #ea580c" : "none",
                    outlineOffset: "1px",
                    cursor: "move",
                    alignItems: el.align === "center" ? "center" : "flex-start",
                    justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
                  }}
                >
                  {content}

                  {/* Corner resize handle */}
                  {isSelected && (
                    <div
                      data-resize-handle="bottom-right"
                      onMouseDown={(e) => handleResizeMouseDown(e, el, "bottom-right")}
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-orange-600 border border-white rounded-full z-20 shadow-sm cursor-nwse-resize transform translate-x-1 translate-y-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Sidebar: Inspector ──────────────────────────── */}
        <div className="xl:w-72 p-5 shrink-0 bg-gray-50/20 flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Properties</p>
          
          {selectedEl ? (
            <div className="space-y-4 text-xs">
              
              {/* Info */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                <span className="font-bold text-orange-800 block text-xs">{selectedEl.name}</span>
                <span className="text-[10px] text-orange-600 block mt-0.5">ID: {selectedEl.id}</span>
              </div>

              {/* Box dimensions */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Left (X)</label>
                  <input
                    type="number"
                    value={selectedEl.left}
                    onChange={(e) => updateElement(selectedEl.id, "left", Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Top (Y)</label>
                  <input
                    type="number"
                    value={selectedEl.top}
                    onChange={(e) => updateElement(selectedEl.id, "top", Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="mt-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Width (W)</label>
                  <input
                    type="number"
                    value={selectedEl.width}
                    onChange={(e) => updateElement(selectedEl.id, "width", Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="mt-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Height (H)</label>
                  <input
                    type="number"
                    value={selectedEl.height}
                    onChange={(e) => updateElement(selectedEl.id, "height", Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Text styling */}
              {selectedEl.id !== "schoolBox" && selectedEl.id !== "studentBox" && (
                <div className="space-y-3.5 pt-2">
                  
                  {/* Font Size slider */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Font Size</span>
                      <span className="font-bold text-gray-700">{selectedEl.fontSize || 12}px</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={32}
                      value={selectedEl.fontSize || 12}
                      onChange={(e) => updateElement(selectedEl.id, "fontSize", Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                  </div>

                  {/* Alignment & Weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Weight</span>
                      <select
                        value={selectedEl.fontWeight || "normal"}
                        onChange={(e) => updateElement(selectedEl.id, "fontWeight", e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500 font-semibold"
                      >
                        <option value="normal">Normal</option>
                        <option value="semibold">Semibold</option>
                        <option value="bold">Bold</option>
                        <option value="extrabold">Extra Bold</option>
                      </select>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Color</span>
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg bg-white p-1">
                        <input
                          type="color"
                          value={selectedEl.color || "#000000"}
                          onChange={(e) => updateElement(selectedEl.id, "color", e.target.value)}
                          className="w-6 h-6 border-0 cursor-pointer p-0 shrink-0"
                        />
                        <span className="font-mono text-[10px] uppercase truncate">{selectedEl.color || "#000000"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Alignment buttons */}
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Alignment</span>
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                      {[
                        { key: "left", Icon: AlignLeft },
                        { key: "center", Icon: AlignCenter },
                        { key: "right", Icon: AlignRight },
                      ].map((align) => (
                        <button
                          key={align.key}
                          onClick={() => updateElement(selectedEl.id, "align", align.key)}
                          className={`flex-1 py-1.5 flex justify-center items-center hover:bg-orange-50 transition-colors ${
                            selectedEl.align === align.key ? "bg-orange-100 text-orange-700 font-bold" : "text-gray-400"
                          }`}
                        >
                          <align.Icon size={13} />
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Border checkbox */}
              {(selectedEl.id === "schoolBox" || selectedEl.id === "studentBox" || selectedEl.id === "notesBox") && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="border-toggle"
                    checked={selectedEl.border !== false}
                    onChange={(e) => updateElement(selectedEl.id, "border", e.target.checked)}
                    className="accent-orange-500 w-4 h-4"
                  />
                  <label htmlFor="border-toggle" className="font-semibold text-gray-700">Show Border Box</label>
                </div>
              )}

              {/* Editable Text area — available for all elements that have static text */}
              {selectedEl.id !== "schoolBox" &&
                selectedEl.id !== "studentBox" &&
                selectedEl.id !== "feesList" &&
                selectedEl.id !== "qrCode" && (
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    {["studentName", "studentClass", "studentParent", "studentAddress", "totalDues", "pageId", "headerDate"].includes(selectedEl.id)
                      ? "Label Prefix / Format"
                      : "Text Content"}
                  </label>
                  <textarea
                    rows={selectedEl.id === "notesBox" ? 4 : 2}
                    value={selectedEl.text || ""}
                    onChange={(e) => updateElement(selectedEl.id, "text", e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-orange-500 resize-none font-medium leading-snug"
                    placeholder={["studentName", "studentClass", "studentParent", "studentAddress", "totalDues", "pageId", "headerDate"].includes(selectedEl.id)
                      ? "Data is auto-filled from student records"
                      : "Enter custom text content..."}
                  />
                  {["studentName", "studentClass", "studentParent", "studentAddress", "totalDues", "pageId", "headerDate"].includes(selectedEl.id) && (
                    <p className="text-[9px] text-gray-400 mt-0.5 italic">This field shows dynamic data from student records.</p>
                  )}
                </div>
              )}

              {/* Visibility toggle in details */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3.5">
                <span className="font-semibold text-gray-600">Show layer on receipt</span>
                <Toggle
                  value={selectedEl.visible !== false}
                  onChange={(v) => updateElement(selectedEl.id, "visible", v)}
                />
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-16 text-center text-gray-400 gap-2">
              <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                <Info size={16} className="text-gray-300" />
              </div>
              <span className="text-xs">No layer selected.<br />Click any element in canvas or layers list to customize.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("bill");
  const [hasChanges, setHasChanges] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  /* ── Load settings ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/app-settings");
        const data = await res.json();
        if (data.status === 200) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.data });
          if (data.data.updatedAt) setSavedAt(new Date(data.data.updatedAt));
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Update a single key ── */
  const update = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/app-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.status === 200) {
        // Push new settings into SWR cache so every component updates instantly
        mutate("/api/app-settings", data.data, false);
        toast.success("Settings saved successfully!");
        setHasChanges(false);
        setSavedAt(new Date());
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  /* ── Reset ── */
  const handleReset = async () => {
    if (!confirm("Reset all settings to defaults? This cannot be undone.")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/app-settings", { method: "DELETE" });
      const data = await res.json();
      if (data.status === 200) {
        setSettings({ ...DEFAULT_SETTINGS });
        // Push defaults into SWR cache so every component resets instantly
        mutate("/api/app-settings", { ...DEFAULT_SETTINGS }, false);
        toast.success("Settings reset to defaults!");
        setHasChanges(false);
      }
    } catch {
      toast.error("Error resetting settings");
    } finally {
      setSaving(false);
    }
  };

  const NAV = [
    { id: "bill",     label: "Bill Layout",   icon: FileText },
    { id: "figma",    label: "Figma Designer", icon: Layers },
    { id: "theme",    label: "Appearance",    icon: Palette },
    { id: "features", label: "Features",      icon: Zap },
    { id: "school",   label: "School Info",   icon: School },
    { id: "pdf",      label: "PDF Export",    icon: Printer },
    { id: "dashboard",label: "Dashboard",     icon: LayoutDashboard },
    { id: "alerts",   label: "Alerts",        icon: Bell },
    { id: "security", label: "Security",      icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-orange-600 font-medium text-sm">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <ResponsiveMenu />
      <div className="min-h-screen bg-orange-50">

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-6 sticky top-14 z-20">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-orange-200 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Settings size={12} /> Admin Panel
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight">App Settings</h1>
              {savedAt && (
                <p className="text-orange-200 text-xs mt-0.5">
                  Last saved: {savedAt.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {hasChanges && (
                <span className="flex items-center gap-1 text-xs bg-amber-400/20 border border-amber-300/30 text-amber-100 rounded-xl px-3 py-1.5 font-semibold animate-pulse">
                  <AlertTriangle size={11} /> Unsaved changes
                </span>
              )}
              <button
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-white/20 disabled:opacity-50"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2 bg-white text-orange-600 text-sm font-bold px-5 py-2 rounded-xl transition-all hover:bg-orange-50 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Sidebar Nav ──────────────────────────────────── */}
            <aside className="lg:w-52 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sticky top-36">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Navigation</p>
                <div className="flex flex-col gap-0.5">
                  {NAV.map((n) => (
                    <NavPill
                      key={n.id}
                      label={n.label}
                      icon={n.icon}
                      onClick={() => {
                        setActiveSection(n.id);
                        if (n.id !== "figma") {
                          setTimeout(() => {
                            const element = document.getElementById(n.id);
                            if (element) {
                              element.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }, 50);
                        }
                      }}
                      active={activeSection === n.id}
                    />
                  ))}
                </div>
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : <Save size={12} />}
                    Save Now
                  </button>
                )}
              </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────── */}
            <main className="flex-1 space-y-5 animate-fadeIn">

              {activeSection === "figma" ? (
                <FigmaDesigner settings={settings} update={update} />
              ) : (
                <>
                  {/* ══ BILL LAYOUT ══════════════════════════════════ */}
                  <Section id="bill" title="Bill Layout & Design" icon={FileText} badge="Customize">

                <SettingRow
                  icon={QrCode}
                  label="Show QR Code in Bill"
                  description="Display UPI payment QR code on the bill screen for quick scanning"
                  badge={{ text: "Popular", color: "bg-green-100 text-green-700" }}
                >
                  <Toggle
                    id="toggle-qr-bill"
                    value={settings.showQrInBill}
                    onChange={(v) => update("showQrInBill", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={School}
                  label="Show School Logo in Bill"
                  description="Display school logo/icon at the top of the bill"
                >
                  <Toggle
                    id="toggle-logo-bill"
                    value={settings.showSchoolLogoInBill}
                    onChange={(v) => update("showSchoolLogoInBill", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Eye}
                  label="Bold Due Amount"
                  description="Highlight the total due amount prominently in the bill"
                >
                  <Toggle
                    id="toggle-bold-due"
                    value={settings.showDueAmountBold}
                    onChange={(v) => update("showDueAmountBold", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Clock}
                  label="Show Payment History"
                  description="Display the full payment timeline at the bottom of the bill"
                >
                  <Toggle
                    id="toggle-payment-history"
                    value={settings.showPaymentHistory}
                    onChange={(v) => update("showPaymentHistory", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Layers}
                  label="Bill Watermark"
                  description="Add a subtle diagonal watermark text across the bill"
                >
                  <Toggle
                    id="toggle-watermark"
                    value={settings.billWatermark}
                    onChange={(v) => update("billWatermark", v)}
                  />
                </SettingRow>

                {settings.billWatermark && (
                  <div className="px-5 pb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Watermark Text
                    </label>
                    <input
                      id="input-watermark-text"
                      type="text"
                      maxLength={20}
                      placeholder="e.g. NPPS, PAID, COPY"
                      value={settings.billWatermarkText}
                      onChange={(e) => update("billWatermarkText", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                )}

                <div className="px-5 pb-4 pt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Bill Footer Text
                  </label>
                  <textarea
                    id="input-footer-text"
                    rows={2}
                    placeholder="Footer text shown on bills..."
                    value={settings.billFooterText}
                    onChange={(e) => update("billFooterText", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-all resize-none"
                  />
                </div>

                <div className="px-5 pb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Header Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="input-header-color"
                        type="color"
                        value={settings.billHeaderColor}
                        onChange={(e) => update("billHeaderColor", e.target.value)}
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5"
                      />
                      <span className="text-xs text-gray-500 font-mono">{settings.billHeaderColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="input-accent-color"
                        type="color"
                        value={settings.billAccentColor}
                        onChange={(e) => update("billAccentColor", e.target.value)}
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5"
                      />
                      <span className="text-xs text-gray-500 font-mono">{settings.billAccentColor}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Bill Copies per Print
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        id={`btn-copies-${n}`}
                        onClick={() => update("billCopies", n)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all border-2 ${
                          settings.billCopies === n
                            ? "bg-orange-600 text-white border-orange-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

              </Section>

              {/* ══ APPEARANCE / THEME ══════════════════════════ */}
              <Section id="theme" title="Appearance & Theme" icon={Palette} badge="Visual">

                <div className="p-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">App Color Theme</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        id={`theme-${theme.id}`}
                        onClick={() => update("appTheme", theme.id)}
                        className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                          settings.appTheme === theme.id
                            ? "border-orange-500 bg-orange-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        {settings.appTheme === theme.id && (
                          <span className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <Check size={9} className="text-white" />
                          </span>
                        )}
                        <div className="flex gap-1 mb-2">
                          {theme.preview.map((cls, i) => (
                            <div key={i} className={`${cls} rounded-md ${i === 0 ? "w-5 h-5" : "w-3 h-3 self-center"}`} />
                          ))}
                        </div>
                        <p className="text-xs font-bold text-gray-700">{theme.label}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 flex items-center gap-1.5">
                    <Info size={12} />
                    Theme colors apply to future visits. Reload after saving.
                  </p>
                </div>

                <SettingRow
                  icon={Moon}
                  label="Dark Mode"
                  description="Switch to dark background for low-light environments"
                  badge={{ text: "Beta", color: "bg-blue-100 text-blue-700" }}
                >
                  <Toggle
                    id="toggle-dark-mode"
                    value={settings.darkMode}
                    onChange={(v) => update("darkMode", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Minimize2}
                  label="Compact Mode"
                  description="Reduce padding and spacing for denser information display"
                >
                  <Toggle
                    id="toggle-compact"
                    value={settings.compactMode}
                    onChange={(v) => update("compactMode", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Zap}
                  label="Page Animations"
                  description="Enable smooth transitions and micro-animations throughout the app"
                >
                  <Toggle
                    id="toggle-animations"
                    value={settings.animationsEnabled}
                    onChange={(v) => update("animationsEnabled", v)}
                  />
                </SettingRow>

                <div className="px-5 pb-4 pt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Navigation Style
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "sticky", label: "Sticky Top", icon: Maximize2 },
                      { id: "floating", label: "Floating FAB", icon: Minimize2 },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        id={`nav-style-${opt.id}`}
                        onClick={() => update("sidebarStyle", opt.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          settings.sidebarStyle === opt.id
                            ? "bg-orange-600 text-white border-orange-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <opt.icon size={13} /> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

              </Section>

              {/* ══ FEATURE TOGGLES ════════════════════════════ */}
              <Section id="features" title="Feature Toggles" icon={Zap} badge="Control">

                <SettingRow
                  icon={MessageSquare}
                  label="SMS Notifications"
                  description="Enable sending Hindi SMS to parents from the bill page"
                >
                  <Toggle
                    id="toggle-sms"
                    value={settings.enableSMS}
                    onChange={(v) => update("enableSMS", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Smartphone}
                  label="WhatsApp Messaging"
                  description="Enable WhatsApp deep-link buttons for notifying parents"
                >
                  <Toggle
                    id="toggle-whatsapp"
                    value={settings.enableWhatsApp}
                    onChange={(v) => update("enableWhatsApp", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Download}
                  label="PDF Download"
                  description="Allow bill PDF download with auto-table formatting"
                >
                  <Toggle
                    id="toggle-pdf"
                    value={settings.enablePDFDownload}
                    onChange={(v) => update("enablePDFDownload", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={QrCode}
                  label="UPI QR Code Widget"
                  description="Show the UPI payment QR code widget on the bill screen"
                >
                  <Toggle
                    id="toggle-upi-qr"
                    value={settings.enableUpiQr}
                    onChange={(v) => update("enableUpiQr", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Bell}
                  label="Announcements Module"
                  description="Show the announcements page link in the navigation"
                >
                  <Toggle
                    id="toggle-announcements"
                    value={settings.enableAnnouncements}
                    onChange={(v) => update("enableAnnouncements", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={AlertTriangle}
                  label="Defaulters Alert Banner"
                  description="Show a prominent alert on dashboard when students have pending dues"
                >
                  <Toggle
                    id="toggle-defaulters-alert"
                    value={settings.enableDefaultersAlert}
                    onChange={(v) => update("enableDefaultersAlert", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Clock}
                  label="Age Calculator Tool"
                  description="Enable the age & admission eligibility calculator in the app"
                >
                  <Toggle
                    id="toggle-age-calculator"
                    value={settings.enableAgeCalculator}
                    onChange={(v) => update("enableAgeCalculator", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Database}
                  label="Export / Database Tools"
                  description="Allow admins to export student data in various formats"
                >
                  <Toggle
                    id="toggle-export"
                    value={settings.enableExportData}
                    onChange={(v) => update("enableExportData", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Database}
                  label="Session Switcher"
                  description="Allow switching between academic sessions (2025-26, 2026-27)"
                >
                  <Toggle
                    id="toggle-session-switch"
                    value={settings.enableSessionSwitch}
                    onChange={(v) => update("enableSessionSwitch", v)}
                  />
                </SettingRow>

              </Section>

              {/* ══ SCHOOL INFO ════════════════════════════════ */}
              <Section id="school" title="School Information" icon={School} badge="Identity">
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      <School size={11} className="inline mr-1" /> School Full Name
                    </label>
                    <input
                      id="input-school-name"
                      type="text"
                      value={settings.schoolName}
                      onChange={(e) => update("schoolName", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="School name"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      <MapPin size={11} className="inline mr-1" /> Address
                    </label>
                    <input
                      id="input-school-address"
                      type="text"
                      value={settings.schoolAddress}
                      onChange={(e) => update("schoolAddress", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="Village, District, State"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      <Phone size={11} className="inline mr-1" /> Contact Phone
                    </label>
                    <input
                      id="input-school-phone"
                      type="tel"
                      value={settings.schoolPhone}
                      onChange={(e) => update("schoolPhone", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      <Mail size={11} className="inline mr-1" /> Contact Email
                    </label>
                    <input
                      id="input-school-email"
                      type="email"
                      value={settings.schoolEmail}
                      onChange={(e) => update("schoolEmail", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="school@example.com"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      <QrCode size={11} className="inline mr-1" /> UPI Payment ID
                    </label>
                    <input
                      id="input-upi-id"
                      type="text"
                      value={settings.schoolUpiId}
                      onChange={(e) => update("schoolUpiId", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="yourname@upi"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Note: The live UPI ID is configured in <code className="bg-gray-100 px-1 rounded">.env.local</code>. This is displayed in UI only.
                    </p>
                  </div>

                </div>
              </Section>

              {/* ══ PDF SETTINGS ═══════════════════════════════ */}
              <Section id="pdf" title="PDF Export Settings" icon={Printer} badge="Export">

                <SettingRow
                  icon={QrCode}
                  label="Include QR Code in PDF"
                  description="Embed the UPI payment QR code in downloaded bill PDFs"
                >
                  <Toggle
                    id="toggle-pdf-qr"
                    value={settings.pdfIncludeQr}
                    onChange={(v) => update("pdfIncludeQr", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={MapPin}
                  label="Include School Address in PDF"
                  description="Print school address header on the generated PDF bill"
                >
                  <Toggle
                    id="toggle-pdf-address"
                    value={settings.pdfIncludeSchoolAddress}
                    onChange={(v) => update("pdfIncludeSchoolAddress", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={FileText}
                  label="Signature Line in PDF"
                  description="Add an authorized signature line at the bottom of PDF bills"
                >
                  <Toggle
                    id="toggle-pdf-signature"
                    value={settings.pdfIncludeSignatureLine}
                    onChange={(v) => update("pdfIncludeSignatureLine", v)}
                  />
                </SettingRow>

                <div className="px-5 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      PDF Page Size
                    </label>
                    <select
                      id="select-pdf-size"
                      value={settings.pdfPageSize}
                      onChange={(e) => update("pdfPageSize", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-all"
                    >
                      <option value="A4">A4</option>
                      <option value="A5">A5</option>
                      <option value="letter">Letter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Font Size
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="input-pdf-font"
                        type="range"
                        min={8}
                        max={14}
                        value={settings.pdfFontSize}
                        onChange={(e) => update("pdfFontSize", Number(e.target.value))}
                        className="flex-1 accent-orange-500"
                      />
                      <span className="text-sm font-bold text-gray-700 w-6">{settings.pdfFontSize}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      PDF Color Scheme
                    </label>
                    <select
                      id="select-pdf-color"
                      value={settings.pdfColorScheme}
                      onChange={(e) => update("pdfColorScheme", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-all"
                    >
                      <option value="orange">Orange (Default)</option>
                      <option value="blue">Navy Blue</option>
                      <option value="green">Forest Green</option>
                      <option value="gray">Professional Gray</option>
                      <option value="black">Monochrome</option>
                    </select>
                  </div>
                </div>

              </Section>

              {/* ══ DASHBOARD ══════════════════════════════════ */}
              <Section id="dashboard" title="Dashboard Settings" icon={LayoutDashboard} badge="Analytics">

                <SettingRow
                  icon={Lock}
                  label="Revenue Password Lock"
                  description="Require a password to view financial totals and revenue charts"
                >
                  <Toggle
                    id="toggle-revenue-lock"
                    value={settings.requirePasswordForRevenue}
                    onChange={(v) => update("requirePasswordForRevenue", v)}
                  />
                </SettingRow>

                <SettingRow
                  icon={RefreshCw}
                  label="Auto-Refresh Dashboard"
                  description="Automatically refresh dashboard data at set intervals"
                >
                  <Toggle
                    id="toggle-auto-refresh"
                    value={settings.autoRefreshDashboard}
                    onChange={(v) => update("autoRefreshDashboard", v)}
                  />
                </SettingRow>

                {settings.autoRefreshDashboard && (
                  <div className="px-5 pb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Refresh Interval (seconds)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="input-refresh-interval"
                        type="range"
                        min={15}
                        max={300}
                        step={15}
                        value={settings.autoRefreshInterval}
                        onChange={(e) => update("autoRefreshInterval", Number(e.target.value))}
                        className="flex-1 accent-orange-500"
                      />
                      <span className="text-sm font-bold text-gray-700 w-16 text-right">
                        {settings.autoRefreshInterval}s
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>15s</span><span>5 min</span>
                    </div>
                  </div>
                )}

              </Section>

              {/* ══ ALERTS / NOTIFICATIONS ═════════════════════ */}
              <Section id="alerts" title="Alerts & Notifications" icon={Bell} badge="Notify">

                <SettingRow
                  icon={AlertTriangle}
                  label="Low Balance Alert"
                  description="Show a warning when a student's due exceeds the threshold"
                >
                  <Toggle
                    id="toggle-low-due"
                    value={settings.lowDueAlert}
                    onChange={(v) => update("lowDueAlert", v)}
                  />
                </SettingRow>

                {settings.lowDueAlert && (
                  <div className="px-5 pb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Due Alert Threshold (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">₹</span>
                      <input
                        id="input-due-threshold"
                        type="number"
                        min={0}
                        step={100}
                        value={settings.lowDueThreshold}
                        onChange={(e) => update("lowDueThreshold", Number(e.target.value))}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                )}

              </Section>

              {/* ══ SECURITY ════════════════════════════════════ */}
              <Section id="security" title="Security Settings" icon={Shield} badge="Protect">

                <SettingRow
                  icon={Lock}
                  label="Revenue Password Protection"
                  description="Restrict revenue stats and charts behind a password on the dashboard"
                >
                  <Toggle
                    id="toggle-revenue-password"
                    value={settings.requirePasswordForRevenue}
                    onChange={(v) => update("requirePasswordForRevenue", v)}
                  />
                </SettingRow>

                <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
                  <div className="flex items-start gap-2.5">
                    <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-700 mb-1">Security Notes</p>
                      <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                        <li>Admin access key is set in <code className="bg-amber-100 px-1 rounded">.env.local</code> (ADMIN_TOKEN)</li>
                        <li>Revenue unlock password is hardcoded in dashboard</li>
                        <li>Sessions expire based on cookie lifetime (1 year by default)</li>
                        <li>All API routes are protected by server-side token validation</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </Section>
                </>
              )}

              {/* ══ SAVE FOOTER ════════════════════════════════ */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-700">Ready to save your changes?</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Settings are stored on the server and persist across restarts.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-gray-600 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    <RotateCcw size={14} /> Reset All
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saving ? "Saving..." : "Save All Settings"}
                  </button>
                </div>
              </div>

            </main>
          </div>
        </div>
      </div>
    </>
  );
}
