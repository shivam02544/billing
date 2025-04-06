"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

import toast from "react-hot-toast";

const SimpleMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    function handleLogout() {
        document.cookie = "token=;";
        toast.success("Logout successfully...")



        window.location.reload();


    }

    return (
        <nav className="bg-orange-600 text-white p-4 z-30 sticky top-0 ">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
                <h1 className="text-xl font-semibold">NPPS</h1>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden focus:outline-none"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
                <ul
                    className={`absolute md:static left-0 top-16 w-full bg-orange-600 md:flex md:gap-6 md:w-auto md:items-center transition-all ${isOpen ? "block" : "hidden"
                        }`}
                >
                    <li className="py-2 px-4 md:py-0 hover:bg-orange-700 md:hover:bg-transparent">
                        <Link href={`/addNewStudent`} className="block text-center md:inline">Add New Student</Link>
                    </li>
                    <li className="py-2 px-4 md:py-0 hover:bg-orange-700 md:hover:bg-transparent">
                        <Link href={`/searchStudent`} className="block text-center md:inline">Search Students</Link>
                    </li>
                    <li className="py-2 px-4 md:py-0 hover:bg-orange-700 md:hover:bg-transparent">
                        <Link href={`/About`} className="block text-center md:inline">Fee Structure</Link>
                    </li>
                    <li className="py-2 px-4 md:py-0 hover:bg-orange-700 md:hover:bg-transparent">
                        <Link href={`/generateBill`} className="block text-center md:inline">Generate Bills</Link>
                    </li>
                    <li className="py-2 px-4 md:py-0 hover:bg-orange-700 md:hover:bg-transparent">
                        <button onClick={handleLogout} className="block text-center md:inline cursor-pointer">Logout</button>
                    </li>

                </ul>
            </div>
        </nav>
    );
};

export default SimpleMenu;
