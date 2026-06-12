'use client'
import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Edit2, Save, X, ArrowLeft, IndianRupee } from 'lucide-react'

const EditBill = ({ pageId, onBack }) => {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isExamFeeAdded, setIsExamFeeAdded] = useState(false)

    const [totalEducationFee, setTotalEducationFee] = useState(0)
    const [totalTransportFee, setTotalTransportFee] = useState(0)
    const [totalExamFee, setTotalExamFee] = useState(0)
    const [otherFee, setOtherFee] = useState(0)
    const [otherFeeMessage, setOtherFeeMessage] = useState('')
    const [paidAmount, setPaidAmount] = useState(0)
    const [totalDue, setTotalDue] = useState(0)
    const [lastMonthDue, setLastMonthDue] = useState(0)
    const [extraClassesFee, setExtraClassesFee] = useState(0)

    const handleCalculateBill = useCallback(() => {
        setTotalDue(
            Number(totalEducationFee || 0) +
            Number(totalTransportFee || 0) +
            Number(otherFee || 0) +
            Number(lastMonthDue || 0) +
            Number(extraClassesFee || 0) +
            (isExamFeeAdded ? Number(totalExamFee || 0) : 0) -
            Number(paidAmount || 0)
        )
    }, [totalEducationFee, totalTransportFee, otherFee, lastMonthDue, extraClassesFee, totalExamFee, paidAmount, isExamFeeAdded])

    useEffect(() => { handleCalculateBill() }, [handleCalculateBill])

    useEffect(() => {
        if (!pageId) return
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`/api/studentsData?pageId=${pageId}`)
                if (!res.ok) throw new Error('Failed to fetch bill data')
                const data = await res.json()
                if (data.status !== 200) {
                    toast.error("Something went wrong — please refresh the page")
                    setError("Failed to fetch bill data")
                    return
                }
                setTotalEducationFee(Number(data.studentBill?.totalEducationFee || 0))
                setTotalTransportFee(Number(data.studentBill?.totalTransportFee || 0))
                setTotalExamFee(Number(data.studentBill?.totalExamFee || 0))
                setOtherFee(Number(data.studentBill?.otherFee || 0))
                setOtherFeeMessage(data.studentBill?.otherFeeMessage || '')
                setPaidAmount(Number(data.studentBill?.paidAmount || 0))
                setTotalDue(Number(data.studentBill?.totalDue || 0))
                setLastMonthDue(Number(data.studentBill?.lastMonthDue || 0))
                setExtraClassesFee(Number(data.studentBill?.extraClassesFee || 0))
                setIsExamFeeAdded(Boolean(data.studentBill?.isExamFeeAdded))
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

    const handleSave = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/editBill`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageId,
                    otherFee: Number(otherFee || 0),
                    otherFeeMessage: String(otherFeeMessage || ''),
                    paidAmount: Number(paidAmount || 0),
                    totalDue: Number(totalDue || 0),
                    lastMonthDue: Number(lastMonthDue || 0),
                }),
            })
            if (!response.ok) throw new Error('Failed to update bill')
            const data = await response.json()
            if (data.status === 200) {
                setIsEditing(false)
                toast.success("Bill updated successfully")
                router.refresh()
            } else {
                toast.error(data.message || 'Failed to update bill')
            }
        } catch (error) {
            console.error('Failed to save bill:', error)
            toast.error("Failed to update bill")
        } finally {
            setLoading(false)
        }
    }

    const inputCls = `w-full border-2 rounded-xl px-3 py-2.5 text-sm text-gray-800 transition-all focus:outline-none ${
        isEditing
            ? "border-orange-400 focus:border-orange-600 bg-white"
            : "border-gray-100 bg-gray-50 cursor-not-allowed text-gray-500"
    }`

    const readOnlyFields = [
        { label: "Total Exam Fee", value: totalExamFee },
        { label: "Extra Classes Fee", value: extraClassesFee },
    ]
    const editableFields = [
        { label: "Education Fee (₹)", value: totalEducationFee, setter: setTotalEducationFee, recalc: true },
        { label: "Transport Fee (₹)", value: totalTransportFee, setter: setTotalTransportFee, recalc: true },
        { label: "Last Month Due (₹)", value: lastMonthDue, setter: setLastMonthDue, recalc: true },
        { label: "Paid Amount (₹)", value: paidAmount, setter: setPaidAmount, recalc: true },
        { label: "Other Fee (₹)", value: otherFee, setter: setOtherFee, recalc: true },
        { label: "Other Fee Label", value: otherFeeMessage, setter: setOtherFeeMessage, type: "text", recalc: false },
    ]

    if (loading && !isEditing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-orange-600 font-medium text-sm">Loading bill data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm w-full">
                    <p className="text-red-600 font-bold mb-3">{error}</p>
                    <button
                        onClick={() => router.refresh()}
                        className="bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 font-semibold text-sm transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-orange-50 pb-10">

            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button
                        onClick={() => onBack ? onBack() : router.back()}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <p className="text-xs text-orange-200 uppercase tracking-widest font-semibold">Edit Bill</p>
                        <h2 className="text-lg font-extrabold">Page ID: {pageId}</h2>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 mt-5 space-y-4">

                {/* Editable fields card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <IndianRupee size={14} className="text-orange-600" />
                            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Fee Fields</span>
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <X size={12} /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : <Save size={12} />}
                                        Save
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Edit2 size={12} /> Edit
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        {editableFields.map((field, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{field.label}</label>
                                <input
                                    type={field.type || "number"}
                                    value={field.value}
                                    onChange={(e) => {
                                        const val = field.type === "text" ? e.target.value : Number(e.target.value || 0)
                                        field.setter(val)
                                    }}
                                    disabled={!isEditing || loading}
                                    className={inputCls}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Read-only fields */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Read-only Fields</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        {readOnlyFields.map((field, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{field.label}</label>
                                <div className="border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400">
                                    ₹{field.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calculated total */}
                <div className="bg-orange-600 rounded-2xl px-6 py-4 flex items-center justify-between">
                    <span className="text-white font-bold">Calculated Total Due</span>
                    <span className="text-2xl font-extrabold text-white">₹{totalDue.toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}

export default EditBill
