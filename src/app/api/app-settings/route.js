import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DEFAULT_BILL_LAYOUT } from "@/helper/billLayout";

// Store settings in a JSON file in the project root (simple, no DB needed)
const SETTINGS_FILE = path.join(process.cwd(), "app-settings.json");

const DEFAULT_SETTINGS = {
  customBillLayout: DEFAULT_BILL_LAYOUT,
  // Bill Layout
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

  // App Theme
  appTheme: "orange",        // orange | blue | green | purple | rose | teal
  darkMode: false,
  compactMode: false,
  animationsEnabled: true,
  sidebarStyle: "sticky",   // sticky | floating

  // Feature Toggles
  enableSMS: true,
  enablePDFDownload: true,
  enableWhatsApp: true,
  enableUpiQr: true,
  enableAgeCalculator: true,
  enableExportData: true,
  enableAnnouncements: true,
  enableDefaultersAlert: true,
  enableSessionSwitch: true,

  // School Info
  schoolName: "NEW PROGRESSIVE PUBLIC SCHOOL",
  schoolAddress: "Nauroo, Jehanabad, Bihar",
  schoolPhone: "",
  schoolEmail: "",
  schoolUpiId: "",

  // Dashboard
  requirePasswordForRevenue: true,
  autoRefreshDashboard: false,
  autoRefreshInterval: 30,  // seconds
  defaultDashboardTab: "overview",

  // Notifications
  lowDueAlert: true,
  lowDueThreshold: 500,
  defaultersEmailAlert: false,

  // PDF Settings
  pdfFontSize: 11,
  pdfColorScheme: "orange",
  pdfIncludeQr: true,
  pdfIncludeSchoolAddress: true,
  pdfIncludeSignatureLine: true,
  pdfPageSize: "A4",

  // Security
  sessionTimeout: 0,        // 0 = never
  requirePasswordForRevenue: true,

  updatedAt: new Date().toISOString(),
};

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_SETTINGS };
}

function writeSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

export async function GET() {
  try {
    const settings = readSettings();
    return NextResponse.json({ status: 200, data: settings });
  } catch (err) {
    return NextResponse.json({ status: 500, message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const current = readSettings();
    const updated = { ...current, ...body, updatedAt: new Date().toISOString() };
    writeSettings(updated);
    return NextResponse.json({ status: 200, message: "Settings saved", data: updated });
  } catch (err) {
    return NextResponse.json({ status: 500, message: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    writeSettings({ ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() });
    return NextResponse.json({ status: 200, message: "Settings reset to defaults" });
  } catch (err) {
    return NextResponse.json({ status: 500, message: err.message }, { status: 500 });
  }
}
