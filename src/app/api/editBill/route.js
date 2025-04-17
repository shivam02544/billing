import { connectDb } from "@/helper/connectDB";
import StudentBillSchema from "@/models/studentBillModel";
import { NextResponse } from "next/server";

export const POST = async (request) => {
  try {
    await connectDb();
    const body = await request.json();
    const bill = await StudentBillSchema.findOne({ pageId: body.pageId });
    bill.totalDue =
      Number(bill.totalEducationFee) +
      Number(bill.totalTransportFee) +
      Number(bill.otherFee) +
      Number(bill.lastMonthDue) +
      Number(bill.extraClassesFee) +
      (bill.isExamFeeAdded ? Number(bill.totalExamFee) : 0) -
      Number(bill.paidAmount);
    let currentHistory = {
      totalEducationFee: bill.totalEducationFee,
      totalTransportFee: bill.totalTransportFee,
      totalExamFee: bill.isExamFeeAdded ? bill.totalExamFee : 0,
      otherFee: bill.otherFee,
      otherFeeMessage: bill.otherFeeMessage,
      extraClassesFee: bill.extraClassesFee,
      totalDue: bill.totalDue,
      lastMonthDue: bill.lastMonthDue,
      paidAmount: 0,
      paymentMode: "--",
    };
    bill.billPaymentHistory.push(currentHistory);
    await bill.save();
    return NextResponse.json({
      status: 200,
      message: "Bill updated successfully",
      bill,
    });
  } catch (error) {
    console.error("Error updating bill:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
};
