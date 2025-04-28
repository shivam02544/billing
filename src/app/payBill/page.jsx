"use client";
import Bill from "@/components/Bill";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import { useState } from "react";
import toast from "react-hot-toast";

export default function PayBillPage() {
    const [pageId, setPageId] = useState("");
    const [showBill, setShowBill] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pageId.trim() === "") {
            toast.error("Please fill the page Id to get the bill");
            return;
        }

        // Reset showBill first, then show again
        setShowBill(false);
        setTimeout(() => {
            setShowBill(true);
        }, 10);
    };

    return (
        <>
            <ResponsiveMenu />
            <div className="min-h-screen flex flex-col items-center bg-white p-4">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl sticky top-[70px] z-20 bg-white"
                >
                    <input
                        type="text"
                        value={pageId}
                        onChange={(e) => setPageId(e.target.value.toUpperCase())}
                        placeholder="Enter Page ID"
                        className="w-full md:flex-1 border-2 border-orange-600 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-orange-700 uppercase"
                    />
                    <button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded text-sm font-semibold"
                    >
                        Show
                    </button>
                </form>

                {showBill && <Bill pageId={pageId} />}
            </div>
        </>
    );
}
