'use client'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const EditBill = ({ pageId }) => {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [totalEducationFee, setTotalEducationFee] = useState(0)
    const [totalTransportFee, setTotalTransportFee] = useState(0)
    const [totalExamFee, setTotalExamFee] = useState(0)
    const [otherFee, setOtherFee] = useState(0)
    const [otherFeeMessage, setOtherFeeMessage] = useState('')
    const [paidAmount, setPaidAmount] = useState(0)
    const [totalDue, setTotalDue] = useState(0)
    const [lastMonthDue, setLastMonthDue] = useState(0)
    const [extraClassesFee, setExtraClassesFee] = useState(0)

    useEffect(() => {
        if (!pageId) return

        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`/api/studentsData?pageId=${pageId}`)
                const data = await res.json()
                if (data.status != 200) {
                    toast.error("Something went wrong please refresh the page")
                    setError("Failed to fetch bill data")
                    return
                }

                setTotalEducationFee(data.studentBill.totalEducationFee || 0)
                setTotalTransportFee(data.studentBill.totalTransportFee || 0)
                setTotalExamFee(data.studentBill.totalExamFee || 0)
                setOtherFee(data.studentBill.otherFee || 0)
                setOtherFeeMessage(data.studentBill.otherFeeMessage || '')
                setPaidAmount(data.studentBill.paidAmount || 0)
                setTotalDue(data.studentBill.totalDue || 0)
                setLastMonthDue(data.studentBill.lastMonthDue || 0)
                setExtraClassesFee(data.studentBill.extraClassesFee || 0)

            } catch (error) {
                console.error('Failed to fetch bill data:', error)
                setError("Failed to fetch bill data")
                toast.error("Failed to fetch bill data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [pageId])

    const handleEdit = () => setIsEditing(true)

    const handleSave = async () => {
        try {
            setLoading(true)
            await axios.put(`/api/student-bill/${pageId}`, {
                totalEducationFee: Number(totalEducationFee),
                totalTransportFee: Number(totalTransportFee),
                totalExamFee: Number(totalExamFee),
                otherFee: Number(otherFee),
                otherFeeMessage,
                paidAmount: Number(paidAmount),
                totalDue: Number(totalDue),
                lastMonthDue: Number(lastMonthDue),
                extraClassesFee: Number(extraClassesFee),
            })
            setIsEditing(false)
            toast.success("Bill updated successfully")
            router.refresh()
        } catch (error) {
            console.error('Failed to save bill:', error)
            toast.error("Failed to update bill")
        } finally {
            setLoading(false)
        }
    }



    if (loading && !isEditing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    <p className="mt-4 text-orange-600">Loading bill data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-50">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => router.refresh()}
                        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-2xl font-semibold text-center text-orange-600 mb-6">
                    Edit Bill Details of {pageId}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { label: 'Total Education Fee', name: 'totalEducationFee', value: totalEducationFee, setter: setTotalEducationFee },
                        { label: 'Total Transport Fee', name: 'totalTransportFee', value: totalTransportFee, setter: setTotalTransportFee },
                        { label: 'Total Exam Fee', name: 'totalExamFee', value: totalExamFee, setter: setTotalExamFee },
                        { label: 'Other Fee', name: 'otherFee', value: otherFee, setter: setOtherFee },
                        { label: 'Other Fee Message', name: 'otherFeeMessage', value: otherFeeMessage, setter: setOtherFeeMessage, type: 'text' },
                        { label: 'Paid Amount', name: 'paidAmount', value: paidAmount, setter: setPaidAmount },
                        { label: 'Total Due', name: 'totalDue', value: totalDue, setter: setTotalDue },
                        { label: 'Last Month Due', name: 'lastMonthDue', value: lastMonthDue, setter: setLastMonthDue },
                        { label: 'Extra Classes Fee', name: 'extraClassesFee', value: extraClassesFee, setter: setExtraClassesFee },
                    ].map((field, i) => (
                        <div key={i} className="flex flex-col">
                            <label htmlFor={field.name} className="text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                            </label>
                            <input
                                type={field.type || 'number'}
                                id={field.name}
                                name={field.name}
                                value={field.value}
                                onChange={(e) => field.setter(field.type === 'text' ? e.target.value : Number(e.target.value))}
                                disabled={!isEditing || loading}
                                className="border border-orange-400 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-6 ">
                    <button
                        onClick={isEditing ? handleSave : handleEdit}
                        disabled={loading}
                        className={`cursor-pointer ${isEditing
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                            } text-white px-4 py-2 rounded-md transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                    </button>

                </div>
            </div>
        </div>
    )
}

export default EditBill
