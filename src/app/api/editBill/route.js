import { connectDb } from "@/helper/connectDB";
import StudentBillSchema from "@/models/studentBillModel";
import StudentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";
export const GET = async (request) => {
  try {
    await connectDb();
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");
    if (!pageId) {
      return NextResponse.json({ status: 400, message: "Page ID is required" });
    }
    const bill = await StudentBillSchema.findOne({ pageId });
    if (!bill) {
      return NextResponse.json({ status: 404, message: "Bill not found" });
    }
    const studentData = await StudentSchema.findById(
      bill.studentIds[0].studentId
    );
    if (!studentData) {
      return NextResponse.json({
        status: 404,
        message: "Student data not found",
      });
    }
    const studentDataObject = {
      pageId: studentData.pageId,
      name: studentData.name,
      className: studentData.className,
      parent: studentData.fatherName,
      village: studentData.village,
      tuitionFee: Number(bill.totalEducationFee) + Number(bill.extraClassesFee),
      transportFee: bill.totalTransportFee,
      examFee: bill.totalExamFee,
      isExamFeeAdded: bill.isExamFeeAdded,
      otherFee: bill.otherFee,
      otherFeeMessage: bill.otherFeeMessage,
      extraClassesFee: bill.extraClassesFee || 0,
      billGeneratedMonth: bill.billGeneratedMonth,
      totalDue: bill.totalDue,
      lastMonthDue: bill.lastMonthDue,
      paidAmount: bill.paidAmount || 0,
    };
    return NextResponse.json({ status: 200, studentDataObject });
  } catch (error) {
    console.error("Error fetching bill:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
};

export const POST = async (request) => {
  try {
    await connectDb();
    const body = await request.json();
    const bill = await StudentBillSchema.findOne({ pageId: body.pageId });
    const monthNumber = new Date().getMonth();
    if (bill.billGeneratedMonth == monthNumber) {
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
    } else {
      return NextResponse.json({
        status: 403,
        message: "Bill cannot be updated for a different month",
      });
    }
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
export const PUT = async (request) => {
  try {
    await connectDb();
    const body = await request.json();
    const bill = await StudentBillSchema.findOne({ pageId: body.pageId });
    if (!bill) {
      return NextResponse.json({ status: 404, message: "Bill not found" });
    }

    bill.otherFee = body.otherFee;
    bill.otherFeeMessage = body.otherFeeMessage;
    bill.paidAmount = body.paidAmount;
    bill.lastMonthDue = body.lastMonthDue;
    bill.totalDue = body.totalDue;
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
