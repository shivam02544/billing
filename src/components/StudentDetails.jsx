"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const StudentDetailPage = ({ pageId, studentName }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [sPageId, setPageId] = useState("");
    const [name, setName] = useState("");
    const [className, setClass] = useState("");
    const [village, setVillage] = useState("");

    const [fatherName, setFatherName] = useState("");

    const [contact, setContact] = useState("");
    const [transport, setTransport] = useState("");
    const [extraClassesFee, setExtraClassesFee] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/studentsCrud?pageId=${pageId}&name=${studentName}`);
                const data = await response.json();
                if (data.statusCode === 200) {
                    const studentData = data.data; // Move this above formatDate call
                    setPageId(studentData.pageId);
                    setStudentId(studentData._id);
                    setName(studentData.name);
                    setClass(studentData.className)
                    setVillage(studentData.village);

                    setFatherName(studentData.fatherName);

                    setContact(studentData.contact);
                    setTransport(studentData.transport);
                    setExtraClassesFee(studentData.extraClassesFee);
                }
            } catch (error) {
                toast.error("Error fetching student data");
                console.error(error);
            }
        };
        fetchData();
    }, [pageId, studentName]);

    const handleEdit = () => setIsEditing(true);
    const handleSave = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/studentsCrud`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pageId: sPageId,
                    studentId,
                    name: name,
                    className: className,
                    village: village,

                    fatherName: fatherName,

                    contact: contact,
                    transport: transport,
                    extraClassesFee,
                }),
            });
            const updateResponse = await response.json();
            if (updateResponse.statusCode === 200) {
                toast.success("Student details updated successfully");
            } else {
                toast.error(updateResponse.message);
            }
        } catch (error) {
            toast.error("Error updating student details");
            console.error(error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }
        try {
            const response = await fetch(`/api/studentsCrud?studentId=${studentId}`, { method: "DELETE" });
            const deleteResponse = await response.json();
            if (deleteResponse.statusCode === 200) {
                toast.success("Student deleted successfully");
            } else {
                toast.error("Error deleting student");
            }
        } catch (error) {
            toast.error("Error deleting student");
            console.error(error);
        } finally {
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-2xl font-semibold text-center text-orange-600 mb-6">Student Details</h2>
                {studentId ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "Page ID", name: "pageId", type: "text", value: sPageId, setter: setPageId },
                            { label: "Name", name: "name", type: "text", value: name, setter: setName },
                            { label: "Class", name: "className", type: "select", options: ["PRE-NC", "NC", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8"], value: className, setter: setClass },
                            { label: "Village", name: "village", type: "text", value: village, setter: setVillage },


                            { label: "Father's Name", name: "fatherName", type: "text", value: fatherName, setter: setFatherName },

                            { label: "Contact", name: "contact", type: "text", value: contact, setter: setContact },
                            { label: "Transport fee", name: "transport", type: "number", value: transport, setter: setTransport },
                            { label: "Extra Classes Fee", name: "extraClassesFee", type: "number", value: extraClassesFee, setter: setExtraClassesFee },
                        ].map((field, index) => (
                            <div key={index} className="flex flex-col">
                                <label
                                    htmlFor={field.name}
                                    className="text-sm font-medium text-gray-700 mb-1"
                                >
                                    {field.label}
                                </label>
                                {field.type === "select" ? (
                                    <select
                                        disabled={!isEditing}
                                        id={field.name}
                                        name={field.name}
                                        value={field.value}
                                        onChange={(e) => field.setter(e.target.value)}
                                        className="border border-orange-400 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        {field.options.map((option, i) => (
                                            <option key={i} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        required
                                        type={field.type}
                                        id={field.name}
                                        name={field.name}
                                        value={field.value}
                                        onChange={(e) => field.setter(e.target.value)}
                                        disabled={!isEditing}
                                        className="border border-orange-400 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Loading student data...</p>
                )}

                <div className="flex justify-between mt-6">
                    <button
                        onClick={isEditing ? handleSave : handleEdit}
                        className={` cursor-pointer ${isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-yellow-600 hover:bg-yellow-700"} text-white px-4 py-2 rounded-md  transition text-sm md:text-base`}
                    >
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm md:text-base"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailPage;
