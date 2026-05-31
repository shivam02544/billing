"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import PaymentHistory from "./PaymentHistoryPage";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EditBill from "./EditBill";
import UpiQrCode from "./UpiQrCode";

// Fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch bill details');
    return res.json().then(data => {
        if (data.status !== 200) throw new Error(data.message || "Failed to fetch bill details");
        return data;
    });
});

const Bill = ({ pageId }) => {
    const router = useRouter();
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState("CASH");
    const [showEditBill, setShowBill] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [isSmsSending, setIsSmsSending] = useState(false);

    // Use SWR for automatic data fetching, caching, and revalidation
    const { data, error, isLoading, mutate } = useSWR(
        pageId ? `/api/billPayment?pageId=${pageId}` : null, 
        fetcher
    );

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to fetch bill details");
        }
    }, [error]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-orange-50 flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    <span className="mt-2 text-orange-600">Loading bill details...</span>
                </div>
            </div>
        );
    }

    if (!data || !data.bills) {
        return (
            <div className="min-h-screen bg-orange-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <p className="text-red-600">No bill details found</p>
                </div>
            </div>
        );
    }

    const students = data.data || [];
    const studentBillDetail = data.bills;

    const handleSendSMS = async () => {
        if (!students || students.length === 0) {
            toast.error("No student data available to send SMS.");
            return;
        }

        const primaryStudent = students[0];
        if (!primaryStudent.contact) {
            toast.error(`No contact number found for ${primaryStudent.name}.`);
            return;
        }

        setIsSmsSending(true);
        const loadingToast = toast.loading("Sending SMS in Hindi...");

        try {
            const response = await fetch("/api/sms/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentName: primaryStudent.name,
                    totalDue: Number(studentBillDetail.totalDue || 0),
                    // Assuming API expects an array of numbers
                    phoneNumbers: [primaryStudent.contact]
                })
            });

            const result = await response.json();
            
            if (response.ok && result.status === 200) {
                toast.success(`Message sent to ${primaryStudent.contact} successfully!`, { id: loadingToast });
            } else {
                toast.error(`Failed to send SMS: ${result.message}`, { id: loadingToast });
            }
        } catch (error) {
            console.error("SMS Error:", error);
            toast.error("An error occurred while sending the SMS.", { id: loadingToast });
        } finally {
            setIsSmsSending(false);
        }
    };

    const handlePayment = async (pageId) => {
        if (!totalAmount || totalAmount <= 0) {
            toast.error("Please enter a valid amount to pay");
            return;
        }

        setIsPaymentProcessing(true);
        try {
// ... skipping unchanged handlePayment code block to save space. We use replace_file_content so exact mapping isn't blocked by missing identical content if start/end match exactly
            await fetch(`/api/calculateTotalFees`)
            const paymentData = {
                pageId,
                totalAmount: Number(totalAmount),
                paymentMode,
            };

            const response = await fetch(`/api/billPayment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            const data = await response.json();

            if (data.status === 200) {
                toast.success("Payment recorded successfully");
                setTotalAmount(0);
                mutate(); // Refresh the bill detail using SWR
            } else {
                toast.error(data.message || "Failed to process payment");
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Failed to process payment");
        } finally {
            setIsPaymentProcessing(false);
        }
    }

    const handleRegenerateBill = async () => {
        try {
            await fetch(`/api/calculateTotalFees`)
            const response = await fetch(`/api/editBill`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pageId }),
            });

            const data = await response.json();

            if (data.status === 200) {
                toast.success("Bill regenerated successfully");
                mutate(); // Refresh the bill detail using SWR
            } else {
                toast.error(data.message || "Failed to regenerate bill");
            }
        } catch (error) {
            console.error("Error regenerating bill:", error);
            toast.error("Failed to regenerate bill");
        }
    }

    const handleDownloadPDF = async () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(234, 88, 12); // Orange
        doc.text(`Bill Receipt - ${studentBillDetail.pageId}`, 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
        
        const tableColumn = ["Student", "Class", "Tuition", "Transport", "Exam", "Extra", "Total"];
        const tableRows = [];
        
        // Use the first student's metadata as the bill's primary owner
        if (students.length > 0) {
            const firstStudent = students[0];
            doc.setFontSize(10);
            const startX = 14;
            let currentY = 40;
            
            doc.text(`Student Name: ${firstStudent.name}`, startX, currentY);
            doc.text(`Class: ${firstStudent.className}`, startX + 90, currentY);
            currentY += 8;
            
            // Only render these if the API returned them.
            if (firstStudent.parent) {
                doc.text(`Father's Name: ${firstStudent.parent}`, startX, currentY);
            }
            if (firstStudent.village) {
                doc.text(`Village/Address: ${firstStudent.village}`, startX + 90, currentY);
            }
            if (firstStudent.parent || firstStudent.village) currentY += 8;
        }
        
        const tableStartY = students.length > 0 ? 60 : 40;

        students.forEach(student => {
            const totalForStudent = Number(student.tuitionFee || 0) +
                Number(student.examFee || 0) +
                Number(student.transportFee || 0) +
                Number(student.extraClassesFee || 0);

            tableRows.push([
                student.name,
                student.className,
                `INR ${Number(student.tuitionFee || 0)}`,
                `INR ${Number(student.transportFee || 0)}`,
                `INR ${Number(student.examFee || 0)}`,
                `INR ${Number(student.extraClassesFee || 0)}`,
                `INR ${totalForStudent}`
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: tableStartY,
            theme: 'grid',
            headStyles: { fillColor: [255, 237, 213], textColor: [194, 65, 12] }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFontSize(11);
        doc.text(`Last Month Due: INR ${Number(studentBillDetail.lastMonthDue || 0)}`, 14, finalY);
        doc.text(`${studentBillDetail.otherFeeMessage || "Other"}: INR ${Number(studentBillDetail.otherFee || 0)}`, 14, finalY + 8);
        doc.text(`Paid Amount: INR ${Number(studentBillDetail.paidAmount || 0)}`, 14, finalY + 16);
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Grand Total (Due): INR ${Number(studentBillDetail.totalDue || 0)}`, 14, finalY + 26);

        // Add UPI QR code to PDF if configured
        const upiId = process.env.NEXT_PUBLIC_SCHOOL_UPI_ID;
        const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || "SCHOOL";
        if (upiId && Number(studentBillDetail.totalDue || 0) > 0) {
            try {
                const QRCode = await import("qrcode");
                const encodedName = encodeURIComponent(schoolName);
                const encodedRef = encodeURIComponent(studentBillDetail.pageId || "");
                const upiUri = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${Number(studentBillDetail.totalDue).toFixed(2)}&cu=INR&tr=${encodedRef}`;
                const qrDataUrl = await QRCode.toDataURL(upiUri, { width: 80, margin: 1, errorCorrectionLevel: "M" });
                const qrY = finalY + 38;
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text("Scan to Pay via UPI:", 14, qrY);
                doc.addImage(qrDataUrl, "PNG", 14, qrY + 4, 28, 28);
            } catch (qrErr) {
                console.error("QR PDF generation failed:", qrErr);
            }
        }

        doc.save(`${studentBillDetail.pageId}_Bill.pdf`);
        toast.success("PDF Downloaded successfully!");
    };

    return showEditBill ?
        <>
            <EditBill pageId={pageId} />
        </> :
        studentBillDetail && (
            <div className="min-h-screen bg-orange-50 p-4 relative">
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-md shadow-md text-xs md:text-sm">
                    {students.length > 0 && Number(studentBillDetail.billGeneratedMonth) === new Date().getMonth() ? "Current Month Bill Generated" : "Bill not generated"}
                </div>
                <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl md:text-2xl font-semibold text-center text-orange-600 mb-4">
                        Bill Payment for {studentBillDetail.pageId}
                    </h2>
                    <div className="flex flex-wrap justify-center">
                        <button onClick={() => setShowBill(true)} className="cursor-pointer px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm m-2 shadow-sm">Edit bill</button>
                        <button onClick={handleRegenerateBill} className="cursor-pointer px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm m-2 shadow-sm">Re-generate bill</button>
                        <button onClick={handleDownloadPDF} className="cursor-pointer px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm m-2 shadow-sm">Download PDF</button>
                        <button 
                            onClick={handleSendSMS} 
                            disabled={isSmsSending}
                            className={`cursor-pointer px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm m-2 shadow-sm flex items-center ${isSmsSending ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSmsSending ? (
                                <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Sending...</>
                            ) : (
                                "💬 SMS Bill (Hindi)"
                            )}
                        </button>
                    </div>

                    {/* Responsive Table Wrapper */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-orange-400 text-xs md:text-sm">
                            <thead>
                                <tr className="bg-orange-100 text-orange-700">
                                    <th className="border border-orange-400 px-2 py-2">Student</th>
                                    <th className="border border-orange-400 px-2 py-2">Class</th>
                                    <th className="border border-orange-400 px-2 py-2">Tuition (₹)</th>
                                    <th className="border border-orange-400 px-2 py-2">Transport (₹)</th>
                                    <th className="border border-orange-400 px-2 py-2">Exam (₹)</th>
                                    <th className="border border-orange-400 px-2 py-2">Extra Classes (₹)</th>
                                    <th className="border border-orange-400 px-2 py-2">Total Due (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => {
                                    const totalForStudent = Number(student.tuitionFee || 0) +
                                        Number(student.examFee || 0) +
                                        Number(student.transportFee || 0) +
                                        Number(student.extraClassesFee || 0);
                                    return (
                                        <tr key={index} className="text-center text-xs md:text-sm">
                                            <td className="border border-orange-400 px-2 py-2 font-medium">{student.name}</td>
                                            <td className="border border-orange-400 px-2 py-2">{student.className}</td>
                                            <td className="border border-orange-400 px-2 py-2">₹{Number(student.tuitionFee || 0)}</td>
                                            <td className="border border-orange-400 px-2 py-2">₹{Number(student.transportFee || 0)}</td>
                                            <td className="border border-orange-400 px-2 py-2">₹{Number(student.examFee || 0)}</td>
                                            <td className="border border-orange-400 px-2 py-2">₹{Number(student.extraClassesFee || 0)}</td>
                                            <td className="border border-orange-400 px-2 py-2 font-bold">₹{totalForStudent}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Fee Breakdown */}
                    <div className="text-right font-semibold text-orange-700 mt-4 text-sm md:text-base">
                        Last Month Due: ₹{Number(studentBillDetail.lastMonthDue || 0)}
                    </div>
                    <div className="text-right font-semibold text-orange-700 mt-2 text-sm md:text-base">
                        {studentBillDetail.otherFeeMessage ? studentBillDetail.otherFeeMessage : "Other"}: ₹{Number(studentBillDetail.otherFee || 0)}
                    </div>

                    <div className="text-right font-semibold text-orange-700 mt-2 text-sm md:text-base">
                        Paid Amount: ₹{Number(studentBillDetail.paidAmount || 0)}
                    </div>

                    {/* Grand Total Calculation */}
                    <div className="text-right font-semibold text-orange-900 mt-2 text-sm md:text-base">
                        Grand Total (After Payment): ₹{Number(studentBillDetail.totalDue || 0)}
                    </div>

                    {/* UPI QR Code */}
                    <div className="flex justify-end mt-3">
                        <UpiQrCode amount={studentBillDetail.totalDue} billReference={studentBillDetail.pageId} size={110} />
                    </div>

                    {/* Total Amount and Payment Mode Input */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-orange-700">Total Amount</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="border border-orange-400 rounded-md p-2 w-full"
onWheel={(e) => e.currentTarget.blur()} 
                            placeholder="Enter total amount"
                            value={totalAmount}
                            onChange={(e) => {
                                const value = e.target.value;
                                setTotalAmount(value === '' ? 0 : Number(value));
                            }}
                        />

                        <label className="block text-sm font-medium text-orange-700 mt-2">Payment Mode</label>
                        <select
                            className="border border-orange-400 rounded-md p-2 w-full"
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                        >
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="BANK">Bank Transfer</option>
                        </select>
                    </div>

                    {/* Payment Button */}
                    <div className="text-center mt-6 space-x-2 flex items-center justify-center">
                        <button
                            className={`cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm md:text-base flex items-center justify-center ${isPaymentProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handlePayment(pageId)}
                            disabled={isPaymentProcessing}
                        >
                            {isPaymentProcessing ? (
                                <div className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                'Proceed to Payment'
                            )}
                        </button>
                    </div>
                </div>
                <PaymentHistory paymentHistory={studentBillDetail.billPaymentHistory || []} />
            </div>
        );
};

export default Bill;
