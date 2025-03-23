"use client"
import React, { useEffect, useState } from "react";

export default function AllStudentBills() {
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        async function getBills() {
            try {
                setIsLoading(true);
                const res = await fetch('/api/bills')
                if (res.ok) {
                    const data = await res.json();
                    setBills(data.data);
                } else {
                    console.error('Failed to fetch bills');
                }
            } catch (error) {
                console.error('Error fetching bills:', error);
            } finally {
                setIsLoading(false);
            }
        }
        getBills()
    }, []);
    function printBill() {
        const printButton = document.querySelector('button');
        printButton.style.display = 'none';
        window.print();
        printButton.style.display = 'block';


    }
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    <span className="mt-2 text-black">Loading bills...</span>
                </div>
            </div>
        );
    }

    return (
        bills &&
        <div className="w-full min-h-screen bg-white text-black m-0 p-0">
            {/* Print Button */}
            <div className="flex justify-end mb-4">
                <button
                    className="bg-black text-white px-4 py-2 text-sm"
                    onClick={printBill}
                >
                    Print All Bills
                </button>
            </div>

            {/* Bills Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {bills.map((bill, index) => (
                    <div key={index} className="border-2 border-black p-4 text-xs w-full relative">
                        {/* Month Display - Top Right */}
                        <div className="absolute top-2 right-2 text-xs font-semibold text-gray-500">
                            On {months[bill.billGeneratedMonth]}
                        </div>

                        {/* PageId Display - Bottom Right */}
                        <div className="absolute bottom-2 right-2 text-xs font-semibold text-gray-700">
                            {bill.pageId}
                        </div>

                        {/* Header */}
                        <div className="text-center font-bold text-lg border-b border-black pb-1 ">
                            NEW PROGRESSIVE PUBLIC SCHOOL
                            <div className="text-xs font-normal ">Nauroo, Jehanabad</div>
                        </div>

                        {/* Student Details */}
                        <div className="grid grid-cols-2 gap-2 border-b border-black py-1">
                            <p><span className="font-semibold">NAME:</span> {bill.name}</p>
                            <p><span className="font-semibold">CLASS:</span> {bill.className}</p>
                            <p><span className="font-semibold">PARENT:</span> {bill.parent}</p>
                            <p><span className="font-semibold">ADDRESS:</span> {bill.village}</p>
                        </div>

                        {/* Fee Breakdown */}
                        <div className="py-1 border-b border-black">

                            {bill.tuitionFee == 0 ? <br /> : <p className="flex justify-between"><span>Tuition Fee:</span> ₹{bill.tuitionFee}</p>}
                            {bill.transportFee == 0 ? <br /> : <p className="flex justify-between"><span>Transport Fee:</span> ₹{bill.transportFee}</p>}
                            {!bill.isExamFeeAdded ? <br /> : <p className="flex justify-between"><span>Exam Fee:</span> ₹{bill.examFee}</p>}
                            {bill.lastMonthDue === 0 ? <br /> : <p className="flex justify-between"><span>Previous Dues:</span> ₹{bill.lastMonthDue}</p>}
                            {bill.otherFee === 0 ? <br /> : <p className="flex justify-between"><span>{bill.otherFeeMessage}:</span> ₹{bill.otherFee}</p>}

                        </div>

                        {/* Total */}
                        <div className="flex justify-between font-bold text-sm py-1">
                            <span>TOTAL DUES:</span> <span>₹{bill.totalDue}</span>
                        </div>

                        {/* Payment Rules */}
                        <div className="text-xs border-t border-black pt-1">
                            <p>1. Fee Payment date is from 1st to 10th of every month.</p>
                            <p>2. ₹50/- late fine if paid after due date.</p>
                            <p>3. Admission may be canceled if not paid.</p>
                        </div>
                    </div>
                )
                )}
            </div>
        </div>
    );
}
