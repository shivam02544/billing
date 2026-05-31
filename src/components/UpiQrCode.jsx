"use client";
import { useEffect, useRef } from "react";

/**
 * UpiQrCode — renders a UPI payment QR code onto a <canvas>.
 *
 * Props:
 *   amount        {number|string} — the total due amount (INR)
 *   billReference {string}        — the bill page ID used as the transaction reference
 *   size          {number}        — canvas size in pixels (default 100)
 */
const UpiQrCode = ({ amount, billReference, size = 100 }) => {
    const canvasRef = useRef(null);

    const upiId = process.env.NEXT_PUBLIC_SCHOOL_UPI_ID;
    const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || "SCHOOL";

    useEffect(() => {
        // Only render when we have a valid UPI ID and a positive amount
        if (!upiId || !canvasRef.current || !amount || Number(amount) <= 0) return;

        const encodedName = encodeURIComponent(schoolName);
        const encodedRef = encodeURIComponent(billReference || "");
        const upiUri = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${Number(amount).toFixed(2)}&cu=INR&tr=${encodedRef}`;

        // Dynamically import qrcode (client-side only)
        import("qrcode").then((QRCode) => {
            QRCode.toCanvas(canvasRef.current, upiUri, {
                width: size,
                margin: 1,
                errorCorrectionLevel: "M",
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            }).catch((err) => {
                console.error("UPI QR generation failed:", err);
            });
        });
    }, [upiId, schoolName, amount, billReference, size]);

    // Don't render anything if UPI ID is not configured
    if (!upiId) return null;

    return (
        <div className="flex flex-col items-center">
            <canvas ref={canvasRef} width={size} height={size} />
            <span style={{ fontSize: "9px", marginTop: "2px", color: "#555" }}>
                Scan to Pay via UPI
            </span>
        </div>
    );
};

export default UpiQrCode;
