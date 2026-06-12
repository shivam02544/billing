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
import {
  Edit2, RefreshCw, Download, MessageSquare, CreditCard,
  CheckCircle2, X, AlertTriangle, IndianRupee, Wallet
} from "lucide-react";

// Fetcher for SWR
const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch bill details");
    return res.json().then((data) => {
      if (data.status !== 200) throw new Error(data.message || "Failed to fetch bill details");
      return data;
    });
  });

/* ─── Payment Confirmation Modal ─────────────────── */
function PayConfirmModal({ amount, mode, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn">
        <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Confirm Payment</h3>
        <p className="text-sm text-gray-500 text-center mb-5">
          Record a payment of{" "}
          <span className="text-green-600 font-extrabold text-lg">₹{Number(amount).toLocaleString()}</span>{" "}
          via <span className="font-semibold text-gray-700">{mode}</span>?
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
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><CheckCircle2 size={15} /> Confirm</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Fee Row ─────────────────────────────────────── */
function FeeRow({ label, value, highlight }) {
  if (!value && value !== 0) return null;
  const num = Number(value);
  if (num === 0) return null;
  return (
    <div className={`flex justify-between items-center py-2 px-4 rounded-xl ${highlight ? "bg-orange-50 border border-orange-100" : ""}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${highlight ? "text-orange-700" : "text-gray-800"}`}>₹{num.toLocaleString()}</span>
    </div>
  );
}

const Bill = ({ pageId }) => {
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [showEditBill, setShowBill] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isSmsSending, setIsSmsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    pageId ? `/api/billPayment?pageId=${pageId}` : null,
    fetcher
  );

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to fetch bill details");
  }, [error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-orange-600 font-medium text-sm">Loading bill...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.bills) {
    return (
      <div className="min-h-screen bg-orange-50 flex justify-center items-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm w-full">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-bold text-gray-700 mb-1">No bill found</p>
          <p className="text-sm text-gray-400">No bill details found for Page ID: <strong>{pageId}</strong></p>
        </div>
      </div>
    );
  }

  const students = data.data || [];
  const studentBillDetail = data.bills;
  const isCurrentMonth =
    students.length > 0 &&
    Number(studentBillDetail.billGeneratedMonth) === new Date().getMonth();

  const handleSendSMS = async () => {
    if (!students || students.length === 0) { toast.error("No student data available to send SMS."); return; }
    const primaryStudent = students[0];
    if (!primaryStudent.contact) { toast.error(`No contact number found for ${primaryStudent.name}.`); return; }
    setIsSmsSending(true);
    const loadingToast = toast.loading("Sending SMS in Hindi...");
    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: primaryStudent.name,
          totalDue: Number(studentBillDetail.totalDue || 0),
          phoneNumbers: [primaryStudent.contact],
        }),
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

  const handlePayment = async () => {
    setShowConfirm(false);
    if (!totalAmount || totalAmount <= 0) { toast.error("Please enter a valid amount to pay"); return; }
    setIsPaymentProcessing(true);
    try {
      await fetch(`/api/calculateTotalFees`);
      const response = await fetch(`/api/billPayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, totalAmount: Number(totalAmount), paymentMode }),
      });
      const data = await response.json();
      if (data.status === 200) {
        toast.success("Payment recorded successfully");
        setTotalAmount(0);
        mutate();
      } else {
        toast.error(data.message || "Failed to process payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleRegenerateBill = async () => {
    try {
      await fetch(`/api/calculateTotalFees`);
      const response = await fetch(`/api/editBill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await response.json();
      if (data.status === 200) {
        toast.success("Bill regenerated successfully");
        mutate();
      } else {
        toast.error(data.message || "Failed to regenerate bill");
      }
    } catch (error) {
      console.error("Error regenerating bill:", error);
      toast.error("Failed to regenerate bill");
    }
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12);
    doc.text(`Bill Receipt - ${studentBillDetail.pageId}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    const tableColumn = ["Student", "Class", "Tuition", "Transport", "Exam", "Extra", "Total"];
    const tableRows = [];
    if (students.length > 0) {
      const firstStudent = students[0];
      doc.setFontSize(10);
      const startX = 14;
      let currentY = 40;
      doc.text(`Student Name: ${firstStudent.name}`, startX, currentY);
      doc.text(`Class: ${firstStudent.className}`, startX + 90, currentY);
      currentY += 8;
      if (firstStudent.parent) doc.text(`Father's Name: ${firstStudent.parent}`, startX, currentY);
      if (firstStudent.village) doc.text(`Village/Address: ${firstStudent.village}`, startX + 90, currentY);
      if (firstStudent.parent || firstStudent.village) currentY += 8;
    }
    const tableStartY = students.length > 0 ? 60 : 40;
    students.forEach((student) => {
      const totalForStudent =
        Number(student.tuitionFee || 0) + Number(student.examFee || 0) +
        Number(student.transportFee || 0) + Number(student.extraClassesFee || 0);
      tableRows.push([
        student.name, student.className,
        `₹${Number(student.tuitionFee || 0)}`, `₹${Number(student.transportFee || 0)}`,
        `₹${Number(student.examFee || 0)}`, `₹${Number(student.extraClassesFee || 0)}`,
        `₹${totalForStudent}`,
      ]);
    });
    autoTable(doc, {
      head: [tableColumn], body: tableRows, startY: tableStartY, theme: "grid",
      headStyles: { fillColor: [255, 237, 213], textColor: [194, 65, 12] },
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Last Month Due: ₹${Number(studentBillDetail.lastMonthDue || 0)}`, 14, finalY);
    doc.text(`${studentBillDetail.otherFeeMessage || "Other"}: ₹${Number(studentBillDetail.otherFee || 0)}`, 14, finalY + 8);
    doc.text(`Paid Amount: ₹${Number(studentBillDetail.paidAmount || 0)}`, 14, finalY + 16);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total (Due): ₹${Number(studentBillDetail.totalDue || 0)}`, 14, finalY + 26);
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

  if (showEditBill) return <EditBill pageId={pageId} onBack={() => setShowBill(false)} />;

  return (
    <>
      {showConfirm && (
        <PayConfirmModal
          amount={totalAmount}
          mode={paymentMode}
          onConfirm={handlePayment}
          onCancel={() => setShowConfirm(false)}
          loading={isPaymentProcessing}
        />
      )}

      <div className="min-h-screen bg-orange-50">

        {/* ── Header strip ──────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-200 uppercase tracking-widest font-semibold">Bill Payment</p>
              <h2 className="text-xl font-extrabold">Page ID: {studentBillDetail.pageId}</h2>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                isCurrentMonth
                  ? "bg-green-500/20 border-green-400/50 text-green-100"
                  : "bg-white/10 border-white/20 text-orange-200"
              }`}
            >
              {isCurrentMonth ? "✓ Bill Generated" : "Bill Not Generated"}
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">

          {/* ── Action buttons ─────────────────────── */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowBill(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700 hover:text-green-700 text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              <Edit2 size={14} /> Edit Bill
            </button>
            <button
              onClick={handleRegenerateBill}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              <RefreshCw size={14} /> Regenerate
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-600 text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              onClick={handleSendSMS}
              disabled={isSmsSending}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50 text-gray-700 hover:text-amber-700 text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {isSmsSending ? (
                <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              ) : <MessageSquare size={14} />}
              SMS (Hindi)
            </button>
          </div>

          {/* ── Students & Fee Table ────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-orange-50 border-b border-orange-100">
              <h3 className="text-sm font-bold text-orange-700 uppercase tracking-wide">Fee Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-orange-50 text-orange-700">
                    <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide">Student</th>
                    <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide">Class</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Tuition</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Transport</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Exam</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Extra</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const totalForStudent =
                      Number(student.tuitionFee || 0) + Number(student.examFee || 0) +
                      Number(student.transportFee || 0) + Number(student.extraClassesFee || 0);
                    return (
                      <tr key={index} className="border-t border-gray-50 hover:bg-orange-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-800">{student.name}</td>
                        <td className="px-4 py-3 text-gray-500">{student.className}</td>
                        <td className="px-4 py-3 text-right text-gray-700">₹{Number(student.tuitionFee || 0)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">₹{Number(student.transportFee || 0)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">₹{Number(student.examFee || 0)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">₹{Number(student.extraClassesFee || 0)}</td>
                        <td className="px-4 py-3 text-right font-bold text-orange-700">₹{totalForStudent}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary rows */}
            <div className="px-4 py-3 border-t border-gray-100 space-y-1">
              <FeeRow label="Previous Dues" value={studentBillDetail.lastMonthDue} />
              <FeeRow label={studentBillDetail.otherFeeMessage || "Other Fee"} value={studentBillDetail.otherFee} />
              <FeeRow label="Paid Amount" value={-(studentBillDetail.paidAmount)} />
            </div>

            {/* Grand total */}
            <div className="px-4 py-4 bg-orange-600 rounded-b-2xl flex items-center justify-between">
              <span className="text-white font-bold">Grand Total Due</span>
              <span className="text-2xl font-extrabold text-white">
                ₹{Number(studentBillDetail.totalDue || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── UPI QR Code ─────────────────────────── */}
          <div className="flex justify-end">
            <UpiQrCode amount={studentBillDetail.totalDue} billReference={studentBillDetail.pageId} size={110} />
          </div>

          {/* ── Payment form ─────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
              <Wallet size={15} className="text-orange-600" />
              <h3 className="text-sm font-bold text-orange-700 uppercase tracking-wide">Record Payment</h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Enter amount"
                    value={totalAmount || ""}
                    onChange={(e) => setTotalAmount(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-gray-800 focus:outline-none focus:border-orange-500 transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:border-orange-500 transition-all text-sm"
                >
                  <option value="CASH">💵 Cash</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="BANK">🏦 Bank Transfer</option>
                </select>
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => {
                  if (!totalAmount || totalAmount <= 0) { toast.error("Please enter a valid amount"); return; }
                  setShowConfirm(true);
                }}
                disabled={isPaymentProcessing}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-60 shadow-md shadow-green-200"
              >
                <CreditCard size={16} /> Proceed to Payment
              </button>
            </div>
          </div>

        </div>

        {/* Payment history */}
        <PaymentHistory paymentHistory={studentBillDetail.billPaymentHistory || []} />
      </div>
    </>
  );
};

export default Bill;
