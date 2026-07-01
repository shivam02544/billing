"use client";
import { useEffect } from "react";
import { useAppSettings } from "@/hooks/useAppSettings";

/**
 * Maps theme IDs to Tailwind v4 CSS variable overrides.
 * Tailwind v4 uses `--color-orange-*` CSS variables for all orange utilities.
 * Overriding them here remaps every `bg-orange-*`, `text-orange-*`, etc. across the whole app.
 */
const THEME_VARS = {
  orange: null, // default — no overrides needed
  blue: {
    "50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe",
    "300": "#93c5fd", "400": "#60a5fa", "500": "#3b82f6",
    "600": "#2563eb", "700": "#1d4ed8", "800": "#1e40af",
    "900": "#1e3a8f", "950": "#172554",
    scroll: "#60a5fa",
  },
  green: {
    "50": "#f0fdf4", "100": "#dcfce7", "200": "#bbf7d0",
    "300": "#86efac", "400": "#4ade80", "500": "#22c55e",
    "600": "#16a34a", "700": "#15803d", "800": "#166534",
    "900": "#14532d", "950": "#052e16",
    scroll: "#4ade80",
  },
  purple: {
    "50": "#f5f3ff", "100": "#ede9fe", "200": "#ddd6fe",
    "300": "#c4b5fd", "400": "#a78bfa", "500": "#8b5cf6",
    "600": "#7c3aed", "700": "#6d28d9", "800": "#5b21b6",
    "900": "#4c1d95", "950": "#2e1065",
    scroll: "#a78bfa",
  },
  rose: {
    "50": "#fff1f2", "100": "#ffe4e6", "200": "#fecdd3",
    "300": "#fda4af", "400": "#fb7185", "500": "#f43f5e",
    "600": "#e11d48", "700": "#be123c", "800": "#9f1239",
    "900": "#881337", "950": "#4c0519",
    scroll: "#fb7185",
  },
  teal: {
    "50": "#f0fdfa", "100": "#ccfbf1", "200": "#99f6e4",
    "300": "#5eead4", "400": "#2dd4bf", "500": "#14b8a6",
    "600": "#0d9488", "700": "#0f766e", "800": "#115e59",
    "900": "#134e4a", "950": "#042f2e",
    scroll: "#2dd4bf",
  },
  indigo: {
    "50": "#eef2ff", "100": "#e0e7ff", "200": "#c7d2fe",
    "300": "#a5b4fc", "400": "#818cf8", "500": "#6366f1",
    "600": "#4f46e5", "700": "#4338ca", "800": "#3730a3",
    "900": "#312e81", "950": "#1e1b4b",
    scroll: "#818cf8",
  },
  amber: {
    "50": "#fffbeb", "100": "#fef3c7", "200": "#fde68a",
    "300": "#fcd34d", "400": "#fbbf24", "500": "#f59e0b",
    "600": "#d97706", "700": "#b45309", "800": "#92400e",
    "900": "#78350f", "950": "#451a03",
    scroll: "#fbbf24",
  },
};

export default function ThemeInjector() {
  const { settings } = useAppSettings();

  useEffect(() => {
    // Remove previous injected style
    const prev = document.getElementById("app-theme-style");
    if (prev) prev.remove();

    let css = "";

    /* ── 1. Color theme ───────────────────────────────── */
    const vars = THEME_VARS[settings.appTheme];
    if (vars) {
      const { scroll, ...shades } = vars;
      // Override Tailwind v4's --color-orange-* CSS variables
      const varLines = Object.entries(shades)
        .map(([shade, val]) => `  --color-orange-${shade}: ${val};`)
        .join("\n");
      css += `:root {\n${varLines}\n}\n`;

      // Scrollbar colors (defined in globals.css with hard-coded hex, so override here)
      if (scroll) {
        css += `::-webkit-scrollbar-thumb { background: ${scroll} !important; }\n`;
        css += `::-webkit-scrollbar-track { background: ${vars["50"]} !important; }\n`;
      }
    }

    /* ── 2. Dark mode (CSS invert trick — fast, no rework needed) */
    if (settings.darkMode) {
      css += `
html { filter: invert(1) hue-rotate(180deg); }
img, video, canvas, svg, [class*="qr"], [data-no-invert] {
  filter: invert(1) hue-rotate(180deg);
}
`;
    }

    /* ── 3. Compact mode ──────────────────────────────── */
    if (settings.compactMode) {
      css += `
.py-6 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
.py-5 { padding-top: 0.625rem !important; padding-bottom: 0.625rem !important; }
.p-5  { padding: 0.75rem !important; }
.p-6  { padding: 1rem !important; }
.gap-6 { gap: 0.75rem !important; }
.gap-5 { gap: 0.75rem !important; }
.space-y-6 > * + * { margin-top: 0.75rem !important; }
.space-y-5 > * + * { margin-top: 0.75rem !important; }
`;
    }

    /* ── 4. Disable animations ────────────────────────── */
    if (!settings.animationsEnabled) {
      css += `
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
}
`;
    }

    if (css.trim()) {
      const style = document.createElement("style");
      style.id = "app-theme-style";
      style.textContent = css;
      document.head.appendChild(style);
    }
  }, [settings.appTheme, settings.darkMode, settings.compactMode, settings.animationsEnabled]);

  return null;
}
