import { connectDb } from "@/helper/connectDB";
import studentBillSchema from "@/models/studentBillModel";
import studentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const GET = async () => {
  try {
    const db = await connectDb();
    const StudentSchema = db.models.StudentSchema || db.model("StudentSchema", studentSchema);
    const StudentBillSchema = db.models.StudentBillSchema || db.model("StudentBillSchema", studentBillSchema);

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
    const db = await connectDb();
    const StudentBillSchema = db.models.StudentBillSchema || db.model("StudentBillSchema", studentBillSchema);
    const body = await request.json();
    
    // Validate required fields
    if (body.otherFee === undefined || body.addExamFee === undefined || body.otherFeeMessage === undefined) {
      return NextResponse.json({
        status: 400,
        message: "Missing required fields: otherFee, addExamFee, or otherFeeMessage",
      });
    }
    
    const monthNumber = new Date().getMonth();

    const bills = await StudentBillSchema.find({ billGeneratedMonth: { $ne: monthNumber } });
    const bulkOperations = [];

    for (const bill of bills) {
      const otherFeeVal = Number(body.otherFee || 0) * (bill.studentIds?.length || 0);
      const isExamFeeAddedVal = Boolean(body.addExamFee);
      const lastMonthDueVal = Number(bill.totalDue || 0);

      const totalDueVal =
        Number(bill.totalEducationFee || 0) +
        Number(bill.totalTransportFee || 0) +
        otherFeeVal +
        lastMonthDueVal +
        Number(bill.extraClassesFee || 0) +
        (isExamFeeAddedVal ? Number(bill.totalExamFee || 0) : 0);

      const billGeneratedMonthVal = monthNumber;
      const otherFeeMessageVal = String(body.otherFeeMessage || "");

      const updateOperation = {
        $set: {
          otherFee: otherFeeVal,
          isExamFeeAdded: isExamFeeAddedVal,
          lastMonthDue: lastMonthDueVal,
          totalDue: totalDueVal,
          billGeneratedMonth: billGeneratedMonthVal,
          otherFeeMessage: otherFeeMessageVal,
          paidAmount: 0
        }
      };

      if (Number(bill.paidAmount || 0) === 0) {
        const currentHistory = {
          totalEducationFee: Number(bill.totalEducationFee || 0),
          totalTransportFee: Number(bill.totalTransportFee || 0),
          totalExamFee: isExamFeeAddedVal ? Number(bill.totalExamFee || 0) : 0,
          otherFee: otherFeeVal,
          otherFeeMessage: otherFeeMessageVal,
          extraClassesFee: Number(bill.extraClassesFee || 0),
          totalDue: totalDueVal,
          lastMonthDue: lastMonthDueVal,
          paidAmount: 0,
          paymentMode: "--",
        };
        updateOperation.$push = { billPaymentHistory: currentHistory };
      }

      bulkOperations.push({
        updateOne: {
          filter: { _id: bill._id },
          update: updateOperation
        }
      });
    }

    if (bulkOperations.length > 0) {
      await StudentBillSchema.bulkWrite(bulkOperations);
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
