"use client"
import React, { useState } from 'react'
import ResponsiveMenu from "@/components/ResponsiveMenu";
import toast from 'react-hot-toast';
import UpiQrCode from "@/components/UpiQrCode";
import { Plus, Printer, X, FileText } from 'lucide-react';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const Page = () => {
    const [bills, setBills] = useState([]);
    const [pageId, setPageId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddBill = async () => {
        if (!pageId.trim()) { toast.error('Please enter a Page ID'); return; }
        setLoading(true);
        try {
            const response = await fetch(`/api/editBill?pageId=${pageId}`);
            if (!response.ok) { toast.error('Failed to fetch bill'); return; }
            const data = await response.json();
            if (data.status !== 200) { toast.error(data.message); return; }
            // Prevent duplicates
            if (bills.find(b => b.pageId === data.studentDataObject.pageId)) {
                toast.error('This Page ID is already in the list');
                return;
            }
            setBills([...bills, data.studentDataObject]);
            toast.success('Bill added to print queue');
        } catch (error) {
            toast.error('Error fetching bill: ' + error.message);
        } finally {
            setLoading(false);
            setPageId("");
        }
    };

    const handleRemoveBill = (pageId) => {
        setBills(bills.filter(b => b.pageId !== pageId));
    };

    const handlePrint = () => {
        if (bills.length === 0) { toast.error('No bills to print'); return; }
        window.print();
    };

    return (
        <>
            <div className='no-print z-30 sticky top-0'>
                <ResponsiveMenu />
            </div>

            {/* ── Control panel (hidden on print) ──── */}
            <div className="no-print min-h-screen bg-orange-50 p-4">

                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-5 rounded-2xl mb-4 max-w-2xl mx-auto">
                    <h2 className="text-xl font-extrabold flex items-center gap-2">
                        <FileText size={20} /> Get Student Bills
                    </h2>
                    <p className="text-orange-100 text-sm mt-0.5">
                        Add Page IDs one by one, then print all at once
                    </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">

                    {/* Input card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Enter Page ID
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border-2 border-orange-300 rounded-xl px-4 py-2.5 text-gray-800 uppercase font-semibold text-sm focus:outline-none focus:border-orange-500 transition-all placeholder:normal-case placeholder:font-normal placeholder:text-gray-400 disabled:opacity-50"
                                placeholder="e.g. A001"
                                value={pageId}
                                onChange={(e) => setPageId(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === "Enter" && handleAddBill()}
                                disabled={loading}
                            />
                            <button
                                onClick={handleAddBill}
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
                            >
                                {loading ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : <Plus size={16} />}
                                Add
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Press Enter to quickly add bills</p>
                    </div>

                    {/* Queue */}
                    {bills.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                                <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">Print Queue</span>
                                <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full">
                                    {bills.length} bill{bills.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {bills.map((bill, idx) => (
                                    <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-orange-50 transition-colors">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{bill.name}</p>
                                            <div className="flex gap-2 mt-0.5">
                                                <span className="text-xs text-gray-400">{bill.className}</span>
                                                <span className="text-xs bg-orange-100 text-orange-700 font-bold px-1.5 rounded">{bill.pageId}</span>
                                                <span className="text-xs font-bold text-red-600">₹{bill.totalDue} due</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBill(bill.pageId)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove from queue"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Print button */}
                    <button
                        onClick={handlePrint}
                        disabled={bills.length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-green-200"
                    >
                        <Printer size={18} />
                        Print {bills.length > 0 ? `${bills.length} Bill${bills.length !== 1 ? "s" : ""}` : "Bills"}
                    </button>
                </div>
            </div>

            {/* ── Printable bills ───────────────────── */}
            <div className="w-full min-h-screen bg-white text-black m-0 p-0">
                <div className='flex flex-wrap'>
                    {bills.map((bill, index) => (
                        <div key={index} className='no-page-break border-2 border-black w-[22rem] flex flex-col items-center m-1 p-1 relative' style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                            <div className='absolute top-2 right-2 text-xs font-semibold text-gray-500'>
                                On {months[bill.billGeneratedMonth]}
                            </div>
                            <div className='absolute bottom-2 right-2 text-xs font-semibold text-gray-700'>
                                {bill.pageId}
                            </div>
                            <span className='text-sm'>Bill Payment Receipt</span>
                            <div className='border-[1px] border-black text-sm w-full'>
                                <div className='flex flex-col items-center'>
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
                            <div className='flex flex-col w-[96%] my-1 text-xs relative'>
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
                                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-70 pointer-events-none'>
                                    <UpiQrCode amount={bill.totalDue} billReference={bill.pageId} size={70} />
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