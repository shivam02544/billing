"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const SimpleMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [session, setSession] = useState("2025-2026");
    const menuRef = useRef();

    useEffect(() => {
        const storedSession = localStorage.getItem("currentSession");
        if (storedSession) {
            setSession(storedSession);
            document.cookie = `currentSession=${storedSession}; path=/; max-age=${60 * 60 * 24 * 365}`;
        } else {
            localStorage.setItem("currentSession", "2025-2026");
            document.cookie = `currentSession=2025-2026; path=/; max-age=${60 * 60 * 24 * 365}`;
            setSession("2025-2026");
        }
    }, []);

    const handleSessionChange = (e) => {
        const newSession = e.target.value;
        setSession(newSession);
        localStorage.setItem("currentSession", newSession);
        document.cookie = `currentSession=${newSession}; path=/; max-age=${60 * 60 * 24 * 365}`;
        window.location.reload(); // Reload to reflect changes globally across the app
    };

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
                <div className="md:hidden flex items-center gap-4">
                    <select 
                        value={session} 
                        onChange={handleSessionChange} 
                        className="bg-orange-700 text-white text-sm font-semibold rounded p-1 outline-none border border-orange-500"
                    >

                        <option value="2025-2026">2025-2026 (Current)</option>
                        <option value="2026-2027">2026-2027 (Upcoming)</option>
                    </select>
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
                        <select 
                            value={session} 
                            onChange={handleSessionChange} 
                            className="bg-orange-700 text-white text-sm font-semibold rounded p-1 outline-none border border-orange-500 cursor-pointer hover:bg-orange-800 transition"
                        >

                            <option value="2025-2026">2025-2026 (Current)</option>
                            <option value="2026-2027">2026-2027 (Upcoming)</option>
                        </select>
                    </li>
                    <li>
                        <Link href="/dashboard" className="hover:text-orange-300">
                            Dashboard
                        </Link>
                    </li>
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
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        Dashboard
                    </Link>
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
