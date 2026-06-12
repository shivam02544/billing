import "./globals.css";
import { Toaster } from "react-hot-toast";
import StickyMenu from "@/components/StickyMenu";

export const metadata = {
  title: "NPPS — New Progressive Public School",
  description: "School fee management system for New Progressive Public School, Nauroo, Jehanabad.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <StickyMenu />
        {children}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#ea580c', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
