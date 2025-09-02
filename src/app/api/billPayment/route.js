import { connectDb } from "@/helper/connectDB";
import FeeSchema from "@/models/feeModel";
import StudentBillSchema from "@/models/studentBillModel";
import StudentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";

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

    const data = await Promise.all(
      bills.studentIds.map(async (studentId) => {
        const studentData = await StudentSchema.findById(studentId.studentId);
        
        // Check if student exists
        if (!studentData) {
          return null;
        }
        
        const studentFeeDetail = await FeeSchema.findOne({
          className: studentData.className,
        });

        return {
          name: studentData.name,
          className: studentData.className,
          tuitionFee: studentFeeDetail ? Number(studentFeeDetail.fee || 0) : 0,
          isExamFeeAdded: Boolean(bills.isExamFeeAdded),
          transportFee: studentData.transport ? Number(studentData.transport || 0) : 0,
          examFee: bills.isExamFeeAdded && studentFeeDetail ? Number(studentFeeDetail.examFee || 0) : 0,
          otherFee: studentFeeDetail ? Number(studentFeeDetail.otherFee || 0) : 0,
          extraClassesFee: Number(studentData.extraClassesFee || 0),
        };
      })
    );

    // Filter out null values
    const validData = data.filter(Boolean);

    return NextResponse.json({
      status: 200,
      data: validData,
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

    // Validate required fields
    if (!pageId || totalAmount === undefined || !paymentMode) {
      return NextResponse.json({
        status: 400,
        message: "Missing required fields: pageId, totalAmount, or paymentMode",
      });
    }

    const bill = await StudentBillSchema.findOne({ pageId });
    if (!bill) {
      return NextResponse.json({
        status: 404,
        message: "No bill found for the given pageId",
      });
    }

    const numericTotalAmount = Number(totalAmount || 0);
    const numericPaidAmount = Number(bill.paidAmount || 0);
    const numericTotalDue = Number(bill.totalDue || 0);

    bill.paidAmount = numericPaidAmount + numericTotalAmount;
    bill.totalDue = numericTotalDue - numericTotalAmount;
    bill.billPaidMonth = new Date().getMonth();
    
    let currentHistory = {
      totalEducationFee: Number(bill.totalEducationFee || 0),
      totalTransportFee: Number(bill.totalTransportFee || 0),
      totalExamFee: bill.isExamFeeAdded ? Number(bill.totalExamFee || 0) : 0,
      otherFee: Number(bill.otherFee || 0),
      otherFeeMessage: bill.otherFeeMessage ? String(bill.otherFeeMessage) : "Other",
      isExamFeeAdded: Boolean(bill.isExamFeeAdded),
      totalDue: Number(bill.totalDue || 0),
      lastMonthDue: Number(bill.lastMonthDue || 0),
      extraClassesFee: Number(bill.extraClassesFee || 0),
      paidAmount: numericTotalAmount,
      paymentMode: String(paymentMode),
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
