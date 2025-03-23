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
          tuitionFee: billDetail.totalEducationFee,
          transportFee: billDetail.totalTransportFee,
          examFee: billDetail.totalExamFee,
          isExamFeeAdded: billDetail.isExamFeeAdded,
          otherFee: billDetail.otherFee,
          otherFeeMessage: billDetail.otherFeeMessage,
          billGeneratedMonth: billDetail.billGeneratedMonth,
          totalDue: billDetail.totalDue,
          lastMonthDue: billDetail.lastMonthDue,
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
    const bills = await StudentBillSchema.find();

    const monthNumber = new Date().getMonth();

    for (const bill of bills) {
      if (bill.billGeneratedMonth != monthNumber) {
        bill.otherFee = body.otherFee * bill.studentIds.length;

        bill.isExamFeeAdded = body.addExamFee;
        bill.lastMonthDue = bill.totalDue;
        bill.totalDue =
          bill.totalEducationFee +
          bill.totalTransportFee +
          bill.otherFee +
          bill.lastMonthDue +
          (bill.isExamFeeAdded ? bill.totalExamFee : 0);

        bill.billGeneratedMonth = monthNumber;
        bill.otherFeeMessage = body.otherFeeMessage;
        if (bill.paidAmount == 0) {
          let currentHistory = {
            totalEducationFee: bill.totalEducationFee,
            totalTransportFee: bill.totalTransportFee,
            totalExamFee: bill.isExamFeeAdded ? bill.totalExamFee : 0,
            otherFee: bill.otherFee,
            otherFeeMessage: bill.otherFeeMessage,
            totalDue: bill.totalDue,
            lastMonthDue: bill.lastMonthDue,
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
