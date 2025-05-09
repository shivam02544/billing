"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PaymentHistory from "./PaymentHistoryPage";
import { useRouter } from "next/navigation";
import EditBill from "./EditBill";

const Bill = ({ pageId }) => {
    const router = useRouter()
    const [students, setStudents] = useState([]);
    const [studentBillDetail, setBill] = useState();
    const [totalAmount, setTotalAmount] = useState();
    const [paymentMode, setPaymentMode] = useState("CASH");
    const [isLoading, setIsLoading] = useState(true);
    const [showEditBill, setShowBill] = useState(false)
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/billPayment?pageId=${pageId}`);
                const data = await res.json();
                setStudents(data.data);
                setBill(data.bills);
            } catch (error) {
                console.error("Error fetching students:", error);
                toast.error("Failed to fetch bill details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

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

    if (!studentBillDetail) {
        return (
            <div className="min-h-screen bg-orange-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <p className="text-red-600">No bill details found</p>
                </div>
            </div>
        );
    }

    const handlePayment = async (pageId) => {
        setIsPaymentProcessing(true);
        try {
            await fetch(`/api/calculateTotalFees`)
            if (totalAmount != 0 && totalAmount != '') {
                const paymentData = {
                    pageId,
                    totalAmount,
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
                    setBill(data.bill)
                } else {
                    toast.error(data.message);
                }
            } else {
                toast.error("Fill the amount to pay first...")
                return
            }
        } catch (error) {
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
                setBill(data.bill);
            } else {
                toast.error(data.message || "Failed to regenerate bill");
            }
        } catch (error) {
            console.error("Error regenerating bill:", error);
            toast.error("Failed to regenerate bill");
        }
    }

    return showEditBill ?
        <>

            <EditBill pageId={pageId} />
        </> :
        studentBillDetail && (
            <div className="min-h-screen bg-orange-50 p-4 relative">
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-md shadow-md text-xs md:text-sm">
                    {students.length > 0 && studentBillDetail.billGeneratedMonth == new Date().getMonth() ? "Current Month Bill Generated" : "Bill not generated"}
                </div>
                <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl md:text-2xl font-semibold text-center text-orange-600 mb-4">
                        Bill Payment for {studentBillDetail.pageId}
                    </h2>
                    <div className="flex flex-wrap justify-center">
                        <button onClick={() => setShowBill(true)} className="cursor-pointer px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm m-2">Edit bill</button>
                        <button onClick={handleRegenerateBill} className="cursor-pointer px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm m-2">Re generate bill</button>
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
                                    const totalForStudent = Number(student.tuitionFee) +
                                        Number(student.examFee) +
                                        Number(student.transportFee) +
                                        Number(student.extraClassesFee);
                                    return (
                                        <tr key={index} className="text-center text-xs md:text-sm">
                                            <td className="border border-orange-400 px-2 py-2 font-medium">{student.name}</td>
                                            <td className="border border-orange-400 px-2 py-2">{student.className}</td>
                                            <td className="border border-orange-400 px-2 py-2">₹{student.tuitionFee}</td>
                                            <td className="border border-orange-400 px-2 py-2">₹{student.transportFee}</td>
                                            <td className="border border-orange-400 px-2 py-2">₹{student.examFee}</td>
                                            <td className="border border-orange-400 px-2 py-2">₹{student.extraClassesFee}</td>
                                            <td className="border border-orange-400 px-2 py-2 font-bold">₹{totalForStudent}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Fee Breakdown */}
                    <div className="text-right font-semibold text-orange-700 mt-4 text-sm md:text-base">
                        Last Month Due: ₹{studentBillDetail.lastMonthDue}
                    </div>
                    <div className="text-right font-semibold text-orange-700 mt-2 text-sm md:text-base">
                        {studentBillDetail.otherFeeMessage ? studentBillDetail.otherFeeMessage : "Other"}: ₹{studentBillDetail.otherFee}
                    </div>

                    <div className="text-right font-semibold text-orange-700 mt-2 text-sm md:text-base">
                        Paid Amount: ₹{studentBillDetail.paidAmount}
                    </div>

                    {/* Grand Total Calculation */}
                    <div className="text-right font-semibold text-orange-900 mt-2 text-sm md:text-base">
                        Grand Total (After Payment): ₹{studentBillDetail.totalDue}
                    </div>

                    {/* Total Amount and Payment Mode Input */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-orange-700">Total Amount</label>
                        <input
                            type="number"
                            className="border border-orange-400 rounded-md p-2 w-full"
                            placeholder="Enter total amount"
                            value={totalAmount}
                            onChange={(e) => {
                                setTotalAmount(e.target.value)
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
                <PaymentHistory paymentHistory={studentBillDetail.billPaymentHistory} />
            </div>
        );
};

export default Bill;
