"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import ResponsiveMenu from "@/components/ResponsiveMenu";


const GenerateBill = () => {
    const [addExamFee, setAddExamFee] = useState(false);
    const [otherFee, setOtherFee] = useState(0);
    const [otherFeeMessage, setOtherFeeMessage] = useState('');
    const [loading, setLoading] = useState(false);


    const handlePrint = () => {
        window.open(
            "/studentBills",  // Change to the correct route
            "_blank",
            "width=700,height=1200,top=100,left=100,noopener,noreferrer"
        );
    };


    const handleGenerateBill = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/bills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    addExamFee,
                    otherFee,
                    otherFeeMessage
                }),
            });

            if (!response.ok) {
                toast.error('Failed to generate bill');
            }

            const data = await response.json();

        } catch (error) {
            console.error('Error generating bill:', error);
            alert('Failed to generate bill');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ResponsiveMenu />
            <div className="min-h-screen bg-orange-50 p-6 flex flex-col items-center">
                <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl md:text-2xl font-semibold text-center text-orange-600 mb-4">
                        Generate Bill
                    </h2>

                    {/* Toggle for Exam Fee */}
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm md:text-base font-medium text-orange-700">Add Exam Fee?</label>
                        <button
                            className={`w-14 h-7 flex items-center rounded-full p-1 transition duration-300 ${addExamFee ? 'bg-green-500' : 'bg-gray-300'}`}
                            onClick={() => setAddExamFee(!addExamFee)}
                        >
                            <div
                                className={`w-6 h-6 bg-white rounded-full shadow-md transform duration-300 ${addExamFee ? 'translate-x-7' : ''}`}
                            />
                        </button>
                    </div>

                    {/* Other Fee Input */}
                    <div className="mb-4">
                        <label className="block text-sm md:text-base font-medium text-orange-700">Other Fee (₹)</label>
                        <input
                            type="number"
                            className="border border-orange-400 rounded-md p-2 w-full mt-1"
                            placeholder="Enter additional fee"
                            value={otherFee}
                            onChange={(e) => setOtherFee(e.target.value)}
                        />
                        <input
                            type="text"
                            className="border border-orange-400 rounded-md p-2 w-full mt-2"
                            placeholder="Enter fee description"
                            value={otherFeeMessage}
                            onChange={(e) => setOtherFeeMessage(e.target.value)}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={handleGenerateBill}
                            className=" cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition text-sm md:text-base flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Generate Bill"}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-sm md:text-base"
                        >
                            Print Bill
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GenerateBill;
