"use client";
import useSWR from "swr";
import { DEFAULT_BILL_LAYOUT } from "@/helper/billLayout";

const fetcher = (url) =>
  fetch(url)
    .then((r) => r.json())
    .then((d) => d.data || {});

export const DEFAULT_SETTINGS = {
  customBillLayout: DEFAULT_BILL_LAYOUT,
  showQrInBill: true,
  showSchoolLogoInBill: true,
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
  requirePasswordForRevenue: true,
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
};

export function useAppSettings() {
  const { data, isLoading, mutate } = useSWR("/api/app-settings", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  return {
    settings: { ...DEFAULT_SETTINGS, ...(data || {}) },
    isLoading,
    mutate,
  };
}
