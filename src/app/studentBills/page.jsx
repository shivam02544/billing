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
            <div className='flex flex-wrap justify-center'>
                {bills.map((bill, index) => (
                    <div key={index} className='no-page-break border-2 border-black w-[22rem] flex flex-col items-center m-3 p-2 relative' style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        {/* Month Display - Top Right */}
                        <div className='absolute top-2 right-2 text-xs font-semibold text-gray-500'>
                            On {months[bill.billGeneratedMonth]}
                        </div>

                        {/* PageId Display - Bottom Right */}
                        <div className='absolute bottom-2 right-2 text-xs font-semibold text-gray-700'>
                            {bill.pageId}
                        </div>

                        <span className='text-sm'>Bill Payment Receipt</span>
                        <div className='border-[1px] border-black text-sm w-full'>
                            <div className='flex flex-col items-center '>
                                <h1 className='font-bold text-lg px-1 text-center'>NEW PROGRESSIVE PUBLIC SCHOOL</h1>
                                <span>Nauroo, Jehanabad</span>
                            </div>
                            <div className='px-3 flex justify-between'>
                                <span>NAME: {bill.name}</span>
                                <span>CLASS: {bill.className}</span>
                            </div>
                            <div className='px-3 flex justify-between'>
                                <span>PARENT: {bill.parent}</span>
                                <span>ADDRESS: {bill.village}</span>
                            </div>
                        </div>
                        <div className='flex flex-col w-[96%] my-1 text-xs'>
                            {bill.tuitionFee != 0 ? <div className='flex justify-between'><span>SCHOOL FEE:</span><span>₹{bill.tuitionFee}</span></div> : <br />}
                            {bill.transportFee != 0 ? <div className='flex justify-between'><span>TRANSPORT FEE:</span><span>₹{bill.transportFee}</span></div> : <br />}
                            {bill.isExamFeeAdded && <div className='flex justify-between'><span>EXAM FEE:</span><span>₹{bill.examFee}</span></div>}
                            {bill.lastMonthDue != 0 ? <div className='flex justify-between'><span>PREVIOUS DUES:</span><span>₹{bill.lastMonthDue}</span></div> : <br />}
                            {bill.otherFee != 0 ? <div className='flex justify-between'><span>{bill.otherFeeMessage == "" ? "OTHER FEE" : bill.otherFeeMessage}:</span><span>₹{bill.otherFee}</span></div> : <br />}
                            {bill.paidAmount != 0 && <div className='flex justify-between'><span>PAID AMOUNT:</span><span>₹{bill.paidAmount}</span></div>}
                            <span>----------------------------------------------------------------</span>
                            <div className='flex justify-between font-bold'>
                                <span>TOTAL DUES:</span>
                                <span>₹{bill.totalDue}</span>
                            </div>
                        </div>
                        <div className='text-xs flex flex-col w-[96%] border-[1px] border-black mb-2 p-1'>
                            <span>1. Fee Payment date is from 1st to 10th of every month.</span>
                            <span>2. ₹50/- late fine if paid after due date.</span>
                            <span>3. Admission may be canceled if not paid.</span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
