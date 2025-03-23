import { connectDb } from "@/helper/connectDB";
import FeeSchema from "@/models/feeModel";
import StudentBillSchema from "@/models/studentBillModel";
import StudentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";
let data;
export const GET = async (request) => {
  try {
    await connectDb();
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    const bills = await StudentBillSchema.findOne({ pageId });
    if (!bills) {
      return NextResponse.json({
        status: 404,
        message: "No bills found for the given pageId",
      });
    }

    data = await Promise.all(
      bills.studentIds.map(async (studentId) => {
        const studentData = await StudentSchema.findById(studentId.studentId);
        const studentFeeDetail = await FeeSchema.findOne({
          className: studentData.className,
        });

        return {
          name: studentData.name,
          className: studentData.className,
          tuitionFee: studentFeeDetail ? studentFeeDetail.fee : 0,
          isExamFeeAdded: bills.isExamFeeAdded,
          transportFee: studentData.transport ? studentData.transport : 0,
          examFee: bills.isExamFeeAdded ? studentFeeDetail.examFee : 0,
          otherFee: studentFeeDetail ? studentFeeDetail.otherFee : 0,
        };
      })
    );

    return NextResponse.json({
      status: 200,
      data,
      bills,
    });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json({
      status: 500,
      message: "Failed to fetch bills",
    });
  }
};
export const POST = async (request) => {
  try {
    await connectDb();
    const body = await request.json();
    const { pageId, totalAmount, paymentMode } = body;

    const bill = await StudentBillSchema.findOne({ pageId });
    if (!bill) {
      return NextResponse.json({
        status: 404,
        message: "No bill found for the given pageId",
      });
    }

    bill.paidAmount = Number(bill.paidAmount) + Number(totalAmount);
    bill.totalDue = Number(bill.totalDue) - Number(totalAmount);
    bill.billPaidMonth = new Date().getMonth();
    let currentHistory = {
      totalEducationFee: bill.totalEducationFee,
      totalTransportFee: bill.totalTransportFee,
      totalExamFee: bill.isExamFeeAdded ? bill.totalExamFee : 0,
      otherFee: bill.otherFee,
      otherFeeMessage: bill.otherFeeMessage ? bill.otherFeeMessage : "Other",
      isExamFeeAdded: bill.isExamFeeAdded,
      totalDue: bill.totalDue,
      lastMonthDue: bill.lastMonthDue,
      paidAmount: Number(totalAmount),
      paymentMode: paymentMode,
    };
    bill.billPaymentHistory.push(currentHistory);
    await bill.save();

    return NextResponse.json({
      status: 200,
      message: "Payment recorded successfully",
      bill,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json({
      status: 500,
      message: "Failed to record payment",
    });
  }
};
