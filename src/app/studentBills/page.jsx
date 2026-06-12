"use client"
import React, { useEffect, useState } from "react";
import UpiQrCode from "@/components/UpiQrCode";
import { Printer } from "lucide-react";

export default function AllStudentBills() {
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    useEffect(() => {
        async function getBills() {
            try {
                setIsLoading(true);
                const res = await fetch('/api/bills');
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
        getBills();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-orange-600 font-medium text-sm">Loading bills...</span>
                </div>
            </div>
        );
    }

    return (
        bills && (
            <div className="w-full min-h-screen bg-white text-black m-0 p-0">

                {/* ── Print toolbar (hidden on print) ── */}
                <div className="no-print flex items-center justify-between px-5 py-3 bg-orange-600 text-white sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Printer size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm leading-tight">Print All Bills</p>
                            <p className="text-orange-200 text-xs">
                                {bills.length} bill{bills.length !== 1 ? "s" : ""} loaded
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors active:scale-95"
                    >
                        <Printer size={15} /> Print All
                    </button>
                </div>

                {/* ── Bills grid ────────────────────── */}
                <div className='flex flex-wrap justify-center pt-2'>
                    {bills.map((bill, index) => (
                        <div key={index} className='no-page-break border-2 border-black w-[22rem] flex flex-col items-center m-3 p-2 relative bg-white' style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                            <div className='w-[96%] flex justify-between items-end mb-1'>
                                <span className='text-sm flex-1 text-center pl-10'>Bill Payment Receipt</span>
                                <span className='text-xs font-semibold text-gray-500'>On {months[bill.billGeneratedMonth]}</span>
                            </div>
                            
                            <div className='border-[1px] border-black text-sm w-[96%]'>
                                <div className='flex flex-col items-center pb-1'>
                                    <h1 className='font-bold text-lg px-1 text-center leading-tight pt-1'>NEW PROGRESSIVE PUBLIC SCHOOL</h1>
                                    <span className="leading-tight text-sm">Nauroo, Jehanabad</span>
                                </div>
                                <div className='px-2 py-1 grid grid-cols-[55%_45%] gap-x-1 border-t border-black/20'>
                                    <div className='flex flex-col leading-tight gap-1'>
                                        <span>NAME: {bill.name}</span>
                                        <span className="flex flex-col"><span>PARENT: {bill.parent}</span></span>
                                    </div>
                                    <div className='flex flex-col leading-tight gap-1'>
                                        <span>CLASS: {bill.className}</span>
                                        <span className="flex flex-col"><span>ADDRESS:</span><span className="break-words">{bill.village}</span></span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='flex flex-col w-[96%] mt-2 mb-1 text-xs relative min-h-[120px] justify-between'>
                                <div className="flex flex-col gap-1 w-full">
                                    {bill.tuitionFee != 0 ? <div className='flex justify-between'><span>SCHOOL FEE:</span><span>₹{bill.tuitionFee}</span></div> : <div className="h-4"></div>}
                                    {bill.transportFee != 0 ? <div className='flex justify-between'><span>TRANSPORT FEE:</span><span>₹{bill.transportFee}</span></div> : <div className="h-4"></div>}
                                    {bill.isExamFeeAdded ? <div className='flex justify-between'><span>EXAM FEE:</span><span>₹{bill.examFee}</span></div> : <div className="h-4"></div>}
                                    {bill.lastMonthDue != 0 ? <div className='flex justify-between'><span>PREVIOUS DUES:</span><span>₹{bill.lastMonthDue}</span></div> : <div className="h-4"></div>}
                                    {bill.otherFee != 0 ? <div className='flex justify-between'><span>{bill.otherFeeMessage == "" ? "OTHER FEE" : bill.otherFeeMessage}:</span><span>₹{bill.otherFee}</span></div> : <div className="h-4"></div>}
                                    {bill.paidAmount != 0 && <div className='flex justify-between'><span>PAID AMOUNT:</span><span>₹{bill.paidAmount}</span></div>}
                                </div>
                                
                                <div className="w-full flex flex-col mt-1">
                                    <div className="w-full overflow-hidden text-clip whitespace-nowrap text-gray-800 tracking-widest">
                                        ------------------------------------------------------------------
                                    </div>
                                    <div className='flex justify-between font-bold text-sm'>
                                        <span>TOTAL DUES:</span>
                                        <span>₹{bill.totalDue}</span>
                                    </div>
                                </div>
                                
                                <div className='absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center bg-white px-2 py-1'>
                                    <UpiQrCode amount={bill.totalDue} billReference={bill.pageId} size={70} />
                                </div>
                            </div>
                            
                            <div className='text-[11px] flex flex-col w-[96%] border-[1px] border-black mb-1 p-1.5'>
                                <span>1. Fee Payment date is from 1st to 10th of every month.</span>
                                <span>2. ₹50/- late fine if paid after due date.</span>
                                <span>3. Admission may be canceled if not paid.</span>
                            </div>
                            
                            <div className='absolute bottom-1 right-2 text-xs font-semibold text-gray-700'>
                                {bill.pageId}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    );
}
