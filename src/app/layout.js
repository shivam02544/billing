import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "NPPS",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={` antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
