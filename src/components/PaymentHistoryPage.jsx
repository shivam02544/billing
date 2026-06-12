"use client";

import { formatDate } from "@/helper/converIntoDate";

const PaymentHistory = ({ paymentHistory = [] }) => {
    const sanitizeValue = (value) => {
        if (value === null || value === undefined) return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    const sanitizeString = (value) => {
        if (typeof value !== "string") return "";
        return value.replace(/[<>]/g, "");
    };

    const totals = paymentHistory.reduce(
        (acc, r) => ({
            lastMonthDue:       acc.lastMonthDue       + sanitizeValue(r.lastMonthDue),
            totalEducationFee:  acc.totalEducationFee  + sanitizeValue(r.totalEducationFee),
            totalTransportFee:  acc.totalTransportFee  + sanitizeValue(r.totalTransportFee),
            totalExamFee:       acc.totalExamFee        + sanitizeValue(r.totalExamFee),
            extraClassesFee:    acc.extraClassesFee    + sanitizeValue(r.extraClassesFee),
            otherFee:           acc.otherFee           + sanitizeValue(r.otherFee),
            paidAmount:         acc.paidAmount         + sanitizeValue(r.paidAmount),
        }),
        { lastMonthDue: 0, totalEducationFee: 0, totalTransportFee: 0, totalExamFee: 0, extraClassesFee: 0, otherFee: 0, paidAmount: 0 }
    );

    const modeColor = (mode) => {
        const m = (mode || "").toUpperCase();
        if (m === "CASH")  return "bg-green-100  text-green-700";
        if (m === "UPI")   return "bg-blue-100   text-blue-700";
        if (m === "BANK")  return "bg-indigo-100 text-indigo-700";
        return "bg-gray-100 text-gray-600";
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-orange-700 uppercase tracking-wide">
                        Payment History
                    </h2>
                    {paymentHistory.length > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full">
                            {paymentHistory.length} records
                        </span>
                    )}
                </div>

                {paymentHistory && paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    {["Date", "Last Due", "Education", "Transport", "Exam", "Extra", "Other", "Paid", "Mode", "Total Due"].map((h) => (
                                        <th key={h} className="px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap border-b border-gray-100">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map((record, index) => {
                                    const due = sanitizeValue(record.totalDue);
                                    const isPaidInFull = due === 0;
                                    return (
                                        <tr
                                            key={index}
                                            className={`border-b border-gray-50 last:border-0 hover:bg-orange-50 transition-colors ${
                                                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                            }`}
                                        >
                                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap font-medium">
                                                {record.date ? formatDate(record.date) : "N/A"}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600">₹{sanitizeValue(record.lastMonthDue)}</td>
                                            <td className="px-3 py-2.5 text-gray-600">₹{sanitizeValue(record.totalEducationFee)}</td>
                                            <td className="px-3 py-2.5 text-gray-600">₹{sanitizeValue(record.totalTransportFee)}</td>
                                            <td className="px-3 py-2.5 text-gray-600">₹{sanitizeValue(record.totalExamFee)}</td>
                                            <td className="px-3 py-2.5 text-gray-600">₹{sanitizeValue(record.extraClassesFee)}</td>
                                            <td className="px-3 py-2.5 text-gray-600">₹{sanitizeValue(record.otherFee)}</td>
                                            <td className="px-3 py-2.5 font-bold text-green-700">
                                                ₹{sanitizeValue(record.paidAmount)}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modeColor(record.paymentMode)}`}>
                                                    {sanitizeString(record.paymentMode) || "—"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {isPaidInFull ? (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                        ✓ Paid
                                                    </span>
                                                ) : (
                                                    <span className="font-bold text-red-600">₹{due}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Totals row */}
                            <tfoot>
                                <tr className="bg-orange-50 border-t-2 border-orange-200">
                                    <td className="px-3 py-2.5 text-xs font-extrabold text-orange-700 uppercase">Totals</td>
                                    <td className="px-3 py-2.5 text-xs font-bold text-gray-700">₹{totals.lastMonthDue}</td>
                                    <td className="px-3 py-2.5 text-xs font-bold text-gray-700">₹{totals.totalEducationFee}</td>
                                    <td className="px-3 py-2.5 text-xs font-bold text-gray-700">₹{totals.totalTransportFee}</td>
                                    <td className="px-3 py-2.5 text-xs font-bold text-gray-700">₹{totals.totalExamFee}</td>
                                    <td className="px-3 py-2.5 text-xs font-bold text-gray-700">₹{totals.extraClassesFee}</td>
                                    <td className="px-3 py-2.5 text-xs font-bold text-gray-700">₹{totals.otherFee}</td>
                                    <td className="px-3 py-2.5 text-xs font-extrabold text-green-700">₹{totals.paidAmount}</td>
                                    <td colSpan={2} />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-gray-500 font-semibold">No payment history found</p>
                        <p className="text-xs text-gray-400 mt-1">Payments will appear here after recording</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
