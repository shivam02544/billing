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
    
    // Validate studentIds array
    if (!bill.studentIds || !Array.isArray(bill.studentIds) || bill.studentIds.length === 0) {
      return NextResponse.json({
        status: 404,
        message: "No students found in this bill",
      });
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
      tuitionFee: Number(bill.totalEducationFee || 0) + Number(bill.extraClassesFee || 0),
      transportFee: Number(bill.totalTransportFee || 0),
      examFee: Number(bill.totalExamFee || 0),
      isExamFeeAdded: Boolean(bill.isExamFeeAdded),
      otherFee: Number(bill.otherFee || 0),
      otherFeeMessage: bill.otherFeeMessage || "",
      extraClassesFee: Number(bill.extraClassesFee || 0),
      billGeneratedMonth: Number(bill.billGeneratedMonth || 0),
      totalDue: Number(bill.totalDue || 0),
      lastMonthDue: Number(bill.lastMonthDue || 0),
      paidAmount: Number(bill.paidAmount || 0),
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
    
    if (!bill) {
      return NextResponse.json({ status: 404, message: "Bill not found" });
    }
    
    const monthNumber = new Date().getMonth();
    if (bill.billGeneratedMonth === monthNumber) {
      bill.totalDue =
        Number(bill.totalEducationFee || 0) +
        Number(bill.totalTransportFee || 0) +
        Number(bill.otherFee || 0) +
        Number(bill.lastMonthDue || 0) +
        Number(bill.extraClassesFee || 0) +
        (bill.isExamFeeAdded ? Number(bill.totalExamFee || 0) : 0) -
        Number(bill.paidAmount || 0);
      let currentHistory = {
        totalEducationFee: Number(bill.totalEducationFee || 0),
        totalTransportFee: Number(bill.totalTransportFee || 0),
        totalExamFee: bill.isExamFeeAdded ? Number(bill.totalExamFee || 0) : 0,
        otherFee: Number(bill.otherFee || 0),
        otherFeeMessage: String(bill.otherFeeMessage || ""),
        extraClassesFee: Number(bill.extraClassesFee || 0),
        totalDue: Number(bill.totalDue || 0),
        lastMonthDue: Number(bill.lastMonthDue || 0),
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

    bill.otherFee = Number(body.otherFee || 0);
    bill.otherFeeMessage = String(body.otherFeeMessage || "");
    bill.paidAmount = Number(body.paidAmount || 0);
    bill.lastMonthDue = Number(body.lastMonthDue || 0);
    bill.totalDue = Number(body.totalDue || 0);
    let currentHistory = {
      totalEducationFee: Number(bill.totalEducationFee || 0),
      totalTransportFee: Number(bill.totalTransportFee || 0),
      totalExamFee: bill.isExamFeeAdded ? Number(bill.totalExamFee || 0) : 0,
      otherFee: Number(bill.otherFee || 0),
      otherFeeMessage: String(bill.otherFeeMessage || ""),
      extraClassesFee: Number(bill.extraClassesFee || 0),
      totalDue: Number(bill.totalDue || 0),
      lastMonthDue: Number(bill.lastMonthDue || 0),
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
