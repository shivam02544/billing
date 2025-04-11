"use client";
import { useState, useEffect } from "react";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import Bill from "@/components/Bill";
import StudentDetailPage from "@/components/StudentDetails";

const StudentSearch = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [showBill, setShowBill] = useState(false)
    const [pageId, setPageId] = useState("");
    const [showStudentDetail, setShowDetail] = useState(false)
    const [studentName, setStudentName] = useState("")
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch student data from API
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/studentsCrud");
                const data = await res.json();
                setStudents(data.data || []);
                setFilteredStudents(data.data || []);
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchQuery(value);
        setFilteredStudents(
            students.filter((student) => {
                const pageId = (student.pageId || '').toLowerCase();
                const name = (student.name || '').toLowerCase();
                const className = (student.className || '').toLowerCase();
                const fatherName = (student.fatherName || '').toLowerCase();
                const village = (student.village || '').toLowerCase();

                return pageId.includes(value) ||
                    name.includes(value) ||
                    className.includes(value) ||
                    fatherName.includes(value) ||
                    village.includes(value);
            })
        );
    };


    return (
        showBill ?
            <>
                <div className="text-center bg-orange-50 ">
                    <button
                        className="z-10 top-0 sticky px-3  py-1 m-4 cursor-pointer bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                        onClick={() => setShowBill(false)}
                    >
                        Back to Search
                    </button>
                </div>
                <Bill pageId={pageId} />
            </>
            :
            showStudentDetail ?
                <>
                    <div className="text-center bg-orange-50 ">
                        <button
                            className="z-10 top-0 sticky px-3  py-1 m-4 cursor-pointer bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                            onClick={() => setShowDetail(false)}
                        >
                            Back to Search
                        </button>
                    </div>
                    <StudentDetailPage pageId={pageId} studentName={studentName} />
                </>
                :

                <>
                    <ResponsiveMenu />
                    <div className="min-h-screen bg-orange-50 p-4">
                        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-semibold text-center text-orange-600 mb-4">
                                Search Students
                            </h2>

                            <input
                                type="text"
                                placeholder="Search by Page ID, Name, Class, Father's Name, or Village..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full border border-orange-400 rounded-md p-2 mb-4 focus:ring-orange-500 focus:border-orange-500"
                            />

                            {isLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                                    <span className="ml-3 text-orange-600">Loading...</span>
                                </div>
                            ) : filteredStudents.length > 0 ? (
                                <ul className="space-y-2">
                                    {filteredStudents.map((student, index) => (
                                        <li
                                            key={index}
                                            className="p-3 bg-orange-100 rounded-md border border-orange-400"
                                        >
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                                <div className="w-full sm:w-auto">
                                                    <p className="font-semibold text-orange-700">{student.name}</p>
                                                    <p className="text-sm text-gray-700 break-words">
                                                        <span className="block sm:inline">Class: {student.className}</span>
                                                        <span className="hidden sm:inline"> | </span>
                                                        <span className="block sm:inline">Father: {student.fatherName}</span>
                                                        <span className="hidden sm:inline"> | </span>
                                                        <span className="block sm:inline">Village: {student.village}</span>
                                                        <span className="hidden sm:inline"> | </span>
                                                        <span className="block text-orange-600 font-bold sm:inline">Page ID: {student.pageId}</span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
                                                    <button
                                                        className="cursor-pointer px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex-1 sm:flex-none"
                                                        onClick={() => {
                                                            setPageId(student.pageId);
                                                            setShowBill(true)
                                                        }}
                                                    >
                                                        Pay Bill
                                                    </button>
                                                    <button
                                                        className="cursor-pointer px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex-1 sm:flex-none"
                                                        onClick={() => {
                                                            setPageId(student.pageId);
                                                            setStudentName(student.name);
                                                            setShowDetail(true)
                                                        }}
                                                    >
                                                        Show All Detail
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600 text-center mt-4">No students found</p>
                            )}
                        </div>
                    </div>
                </>
    );
};

export default StudentSearch;
