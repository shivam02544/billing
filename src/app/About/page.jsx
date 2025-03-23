"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ResponsiveMenu from "@/components/ResponsiveMenu";

const AboutPage = () => {
    const [fees, setFees] = useState([]);

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const res = await fetch("/api/fees");
                const data = await res.json();
                setFees(data.fees.length > 0 ? data.fees : [
                    { className: "Pre-NC", fee: 0, examFee: 0 },
                    { className: "NC", fee: 0, examFee: 0 },
                    { className: "LKG", fee: 0, examFee: 0 },
                    { className: "UKG", fee: 0, examFee: 0 },
                    { className: "1", fee: 0, examFee: 0 },
                    { className: "2", fee: 0, examFee: 0 },
                    { className: "3", fee: 0, examFee: 0 },
                    { className: "4", fee: 0, examFee: 0 },
                    { className: "5", fee: 0, examFee: 0 },
                    { className: "6", fee: 0, examFee: 0 },
                    { className: "7", fee: 0, examFee: 0 },
                    { className: "8", fee: 0, examFee: 0 },
                ]);
            } catch (error) {
                console.error("Error fetching fees:", error);
            }
        };
        fetchFees();
    }, []);

    const handleEditClick = () => setIsEditing(true);

    const handleSaveClick = async () => {
        try {
            const res = await fetch("/api/fees", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fees }),
            });

            const response = await res.json();
            if (response.status === 200) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update fees.");
        }
    };

    return (

        <>
            <ResponsiveMenu />
            <div className="min-h-screen bg-orange-50 p-4">
                <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-center text-orange-600 mb-4">
                        Class Fees Details
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-orange-400">
                            <thead>
                                <tr className="bg-orange-100 text-orange-700">
                                    <th className="border border-orange-400 px-4 py-2">Class</th>
                                    <th className="border border-orange-400 px-4 py-2">Tuition Fee (₹)</th>
                                    <th className="border border-orange-400 px-4 py-2">Exam Fee (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fees.map((fee, index) => (
                                    <tr key={index} className="text-center">
                                        <td className="border border-orange-400 px-4 py-2 font-medium">
                                            {fee.className}
                                        </td>
                                        <td className="border border-orange-400 px-4 py-2">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={fee.fee}
                                                    onChange={(e) => {
                                                        const updatedFees = [...fees];
                                                        updatedFees[index].fee = Number(e.target.value);
                                                        setFees(updatedFees);
                                                    }}
                                                    className="border border-orange-400 rounded-md p-1 w-20 text-right"
                                                />
                                            ) : (
                                                `₹${fee.fee}`
                                            )}
                                        </td>
                                        <td className="border border-orange-400 px-4 py-2">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={fee.examFee}
                                                    onChange={(e) => {
                                                        const updatedFees = [...fees];
                                                        updatedFees[index].examFee = Number(e.target.value);
                                                        setFees(updatedFees);
                                                    }}
                                                    className="border border-orange-400 rounded-md p-1 w-20 text-right"
                                                />
                                            ) : (
                                                `₹${fee.examFee}`
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-center mt-6">
                        {isEditing ? (
                            <button
                                onClick={handleSaveClick}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                            >
                                Save Changes
                            </button>
                        ) : (
                            <button
                                onClick={handleEditClick}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                            >
                                Edit All Fees
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutPage;
