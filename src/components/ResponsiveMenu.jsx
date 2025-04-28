"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const SimpleMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef();

    function handleLogout() {
        document.cookie = "token=;";
        toast.success("Logout successfully...");
        window.location.reload();
    }

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="bg-orange-600 text-white p-4 z-30 sticky top-0 w-full shadow-md">
            <div className="flex justify-between items-center max-w-5xl mx-auto">
                <h1 className="text-xl font-bold">NPPS</h1>
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="focus:outline-none"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Desktop Menu */}
                <ul className="hidden md:flex gap-8 items-center font-semibold text-sm">
                    <li>
                        <Link href="/addNewStudent" className="hover:text-orange-300">
                            Add New Student
                        </Link>
                    </li>
                    <li>
                        <Link href="/searchStudent" className="hover:text-orange-300">
                            Search Students
                        </Link>
                    </li>
                    <li>
                        <Link href="/About" className="hover:text-orange-300">
                            Fee Structure
                        </Link>
                    </li>
                    <li>
                        <Link href="/generateBill" className="hover:text-orange-300">
                            Generate Bills
                        </Link>
                    </li>
                    <li>
                        <Link href="/payBill" className="hover:text-orange-300">
                            Pay Bill
                        </Link>
                    </li>
                    <li>
                        <button
                            onClick={handleLogout}
                            className="hover:text-orange-300 cursor-pointer"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div
                    ref={menuRef}
                    className="md:hidden flex flex-col gap-6 mt-4 bg-orange-600 p-4 rounded-lg animate-slideDown"
                >
                    <Link href="/addNewStudent" onClick={() => setIsOpen(false)}>
                        Add New Student
                    </Link>
                    <Link href="/searchStudent" onClick={() => setIsOpen(false)}>
                        Search Students
                    </Link>
                    <Link href="/About" onClick={() => setIsOpen(false)}>
                        Fee Structure
                    </Link>
                    <Link href="/generateBill" onClick={() => setIsOpen(false)}>
                        Generate Bills
                    </Link>
                    <Link href="/payBill" onClick={() => setIsOpen(false)}>
                        Pay Bill
                    </Link>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            )}
        </nav>
    );
};

export default SimpleMenu;
