"use client";

import { formatDate } from "@/helper/converIntoDate";

const PaymentHistory = ({ paymentHistory = [] }) => {
    // Sanitize and validate payment history data
    const sanitizeValue = (value) => {
        if (value === null || value === undefined) return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    const sanitizeString = (value) => {
        if (typeof value !== 'string') return '';
        return value.replace(/[<>]/g, ''); // Basic XSS prevention
    };

    return (
        <div className="min-h-screen bg-orange-50 p-4">
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold text-center text-orange-600 mb-4">
                    Payment History
                </h2>

                {/* Responsive Table Wrapper */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-orange-400 text-xs md:text-sm">
                        <thead>
                            <tr className="bg-orange-100 text-orange-700">
                                <th className="border border-orange-400 px-2 py-2">Date</th>
                                <th className="border border-orange-400 px-2 py-2">Last Due (₹)</th>
                                <th className="border border-orange-400 px-2 py-2">Total Education Fee (₹)</th>
                                <th className="border border-orange-400 px-2 py-2">Transport Fee (₹)</th>
                                <th className="border border-orange-400 px-2 py-2">Exam Fee (₹)</th>
                                <th className="border border-orange-400 px-2 py-2">Extra Classes (₹)</th>
                                <th className="border border-orange-400 px-2 py-2">Other Fee (₹)</th>
                                <th className="border border-orange-400 px-2 py-2">Paid Amount (₹)</th>
                                <th className="border border-orange-400 px-2 py-2">Payment Mode</th>
                                <th className="border border-orange-400 px-2 py-2">Total Due (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory && paymentHistory.length > 0 ? (
                                paymentHistory.map((record, index) => {
                                    // Check if this is a subsequent payment in the same month
                                    const isSameMonthPayment = index > 0 &&
                                        new Date(record.date).getMonth() === new Date(paymentHistory[index - 1].date).getMonth();

                                    return (
                                        <tr key={index} className="text-center text-xs md:text-sm">
                                            <td className="border border-orange-400 px-2 py-2">
                                                {record.date ? formatDate(record.date) : 'N/A'}
                                            </td>
                                            <td className="border border-orange-400 px-2 py-2">
                                                ₹{sanitizeValue(record.lastMonthDue)}
                                            </td>
                                            <td className="border border-orange-400 px-2 py-2">
                                                ₹{sanitizeValue(record.totalEducationFee)}
                                            </td>
                                            <td className="border border-orange-400 px-2 py-2">
                                                ₹{sanitizeValue(record.totalTransportFee)}
                                            </td>
                                            <td className="border border-orange-400 px-2 py-2">
                                                ₹{sanitizeValue(record.totalExamFee)}
                                            </td>
                                            <td className="border border-orange-400 px-2 py-2">
                                                ₹{sanitizeValue(record.extraClassesFee)}
                                            </td>
                                            <td className="border border-orange-400 px-2 py-2">
                                                ₹{sanitizeValue(record.otherFee)}
                                            </td>
                                            <td className="border border-orange-400 px-2 py-2 font-bold">
                                                ₹{sanitizeValue(record.paidAmount)}
                                            </td>
                                            <td className="border border-orange-400 px-2 py-2">
                                                {sanitizeString(record.paymentMode)}
                                            </td>
                                            <td className="border border-orange-400 px-2 py-2">
                                                ₹{sanitizeValue(record.totalDue)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center text-orange-700 py-4 font-semibold">
                                        No payment history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;
