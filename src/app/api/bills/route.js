import { connectDb } from "@/helper/connectDB";
import StudentBillSchema from "@/models/studentBillModel";
import StudentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";
export const GET = async () => {
  try {
    await connectDb();

    // Fetch all bills
    const bills = await StudentBillSchema.find();
    if (!bills.length) {
      return NextResponse.json({ status: 200, data: [] });
    }

    // Get all studentIds from bills
    const studentIds = bills
      .map((bill) => bill.studentIds?.[0]?.studentId)
      .filter(Boolean); // Remove null/undefined

    // Fetch all students in one query
    const students = await StudentSchema.find({ _id: { $in: studentIds } });

    // Create a map for quick lookups
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    // Process bills with student details
    const billData = bills
      .map((billDetail) => {
        const student = studentMap.get(billDetail.studentIds?.[0]?.studentId);
        if (!student) return null;

        return {
          pageId: student.pageId,
          name: student.name,
          className: student.className,
          parent: student.fatherName,
          village: student.village,
          tuitionFee:
            Number(billDetail.totalEducationFee) +
            Number(billDetail.extraClassesFee),
          transportFee: billDetail.totalTransportFee,
          examFee: billDetail.totalExamFee,
          isExamFeeAdded: billDetail.isExamFeeAdded,
          otherFee: billDetail.otherFee,
          otherFeeMessage: billDetail.otherFeeMessage,
          extraClassesFee: billDetail.extraClassesFee || 0,
          billGeneratedMonth: billDetail.billGeneratedMonth,
          totalDue: billDetail.totalDue,
          lastMonthDue: billDetail.lastMonthDue,
          paidAmount: billDetail.paidAmount || 0,
        };
      })
      .filter(Boolean); // Remove null values

    // Define class sorting order
    const classNameOrder = new Map(
      ["PRE-NC", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8"].map(
        (cls, index) => [cls, index]
      )
    );

    // Sort bills by class
    billData.sort(
      (a, b) =>
        (classNameOrder.get(a.className) ?? 99) -
        (classNameOrder.get(b.className) ?? 99)
    );

    return NextResponse.json({ status: 200, data: billData });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json({ status: 500, message: "Failed to get bills" });
  }
};

export const POST = async (request) => {
  try {
    await connectDb();
    const body = await request.json();
    
    // Validate required fields
    if (body.otherFee === undefined || body.addExamFee === undefined || body.otherFeeMessage === undefined) {
      return NextResponse.json({
        status: 400,
        message: "Missing required fields: otherFee, addExamFee, or otherFeeMessage",
      });
    }
    
    const bills = await StudentBillSchema.find();
    const monthNumber = new Date().getMonth();

    for (const bill of bills) {
      if (bill.billGeneratedMonth !== monthNumber) {
        bill.otherFee = Number(body.otherFee || 0) * (bill.studentIds?.length || 0);
        bill.isExamFeeAdded = Boolean(body.addExamFee);
        bill.lastMonthDue = Number(bill.totalDue || 0);

        bill.totalDue =
          Number(bill.totalEducationFee || 0) +
          Number(bill.totalTransportFee || 0) +
          Number(bill.otherFee || 0) +
          Number(bill.lastMonthDue || 0) +
          Number(bill.extraClassesFee || 0) +
          (bill.isExamFeeAdded ? Number(bill.totalExamFee || 0) : 0);

        bill.billGeneratedMonth = monthNumber;
        bill.otherFeeMessage = String(body.otherFeeMessage || "");

        if (Number(bill.paidAmount || 0) === 0) {
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
        }

        bill.paidAmount = 0;
        await bill.save();
      }
    }

    return NextResponse.json({
      status: 201,
      message: "Bill created successfully",
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json({
      status: 500,
      message: "Failed to create bill",
    });
  }
};
