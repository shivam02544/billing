"use client"
import React, { useState, useEffect } from 'react'
import ResponsiveMenu from "@/components/ResponsiveMenu";
import toast from 'react-hot-toast';

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const Page = () => {
    const [bills, setBills] = useState([]);
    const [pageId, setPageId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddBill = async () => {
        if (!pageId.trim()) {
            toast.error('Please enter a page ID');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/editBill?pageId=${pageId}`);
            if (!response.ok) {
                toast.error('Failed to fetch bill');
                return;
            }
            const data = await response.json();
            if (data.status !== 200) {
                toast.error(data.message);
                return;
            }
            setBills([...bills, data.studentDataObject]);
            toast.success('Bill added successfully');
        } catch (error) {
            toast.error('Error fetching bill: ' + error.message);
        } finally {
            setLoading(false);
            setPageId("");
        }
    };

    const handlePrint = () => {
        if (bills.length === 0) {
            toast.error('No bills to print');
            return;
        }
        const noPrint = document.getElementsByClassName("no-print")
        noPrint[0].style.display = "none"
        noPrint[1].style.display = "none"
        window.print();
        noPrint[0].style.display = "display"
        noPrint[1].style.display = "flex"
    };

    return (
        <>
            <div className='no-print z-30 sticky top-0'><ResponsiveMenu /></div>
            <div className="no-print min-h-screen bg-orange-50 p-6 flex flex-col items-center">
                <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-lg no-print">
                    <h2 className="text-xl md:text-2xl font-semibold text-center text-orange-600 mb-4">
                        Generate Bill
                    </h2>

                    <input
                        type="text"
                        className="border border-orange-400 rounded-md p-2 w-full mt-2"
                        placeholder="Enter page Id"
                        value={pageId}
                        onChange={(e) => setPageId(e.target.value)}
                        disabled={loading}
                    />
                    {/* Buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={handleAddBill}
                            className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition text-sm md:text-base flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Adding...
                                </div>
                            ) : (
                                'Add'
                            )}
                        </button>
                        <button
                            onClick={handlePrint}
                            className={`cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm md:text-base ${bills.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={bills.length === 0}
                        >
                            Print Bill
                        </button>
                    </div>
                </div>
            </div>
            {/* bill */}
            <div className="w-full min-h-screen bg-white text-black m-0 p-0">
                <div className='flex flex-wrap '>
                    {bills.map((bill, index) => (
                        <div key={index} className='no-page-break border-2 border-black w-[22rem] flex flex-col items-center  m-3 p-2 relative' style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
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
        </>
    )
}

export default Page