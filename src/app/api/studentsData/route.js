import { connectDb } from "@/helper/connectDB";
import FeeSchema from "@/models/feeModel";
import StudentBillSchema from "@/models/studentBillModel";
import StudentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";
export const GET = async (request) => {
  await connectDb();
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");
    const students = await StudentSchema.find({ pageId });
    const studentBill = await StudentBillSchema.findOne({ pageId });
    if (students.length === 0) {
      return NextResponse.json({
        status: 404,
        message: "No students found",
      });
    }
    return NextResponse.json({
      status: 200,
      data: students,
      studentBill,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
};

export const POST = async (request) => {
  await connectDb();
  try {
    const {
      pageId,
      name,
      className,
      village,

      fatherName,

      contact,
      transport,
      dueFee,
      extraClassesFee,
    } = await request.json();

    // Input validation
    if (!pageId || !name || !className) {
      return NextResponse.json({
        status: 400,
        message: "Required fields are missing",
      });
    }
    // Check for existing student
    const student = await StudentSchema.findOne({ pageId, name });
    if (student) {
      return NextResponse.json({
        status: 400,
        message: "Student with the same pageId and name already exists",
      });
    }

    // Get fee details first
    const feeDetail = await FeeSchema.findOne({ className });

    if (!feeDetail) {
      return NextResponse.json({
        status: 400,
        message: "Fee structure not found for this class",
      });
    }

    // Create new student
    const newStudent = new StudentSchema({
      pageId,
      name,
      className,
      village,

      fatherName,

      contact,
      transport,
      dueFee,
      extraClassesFee,
    });

    const studentData = await newStudent.save();

    // Handle bill creation/update
    let userBill = await StudentBillSchema.findOne({ pageId });

    if (!userBill) {
      // Create new bill
      userBill = new StudentBillSchema({
        pageId: studentData.pageId,
        studentIds: [{ studentId: studentData._id }],
        totalEducationFee: Number(feeDetail.fee),
        totalTransportFee: Number(studentData.transport),
        totalExamFee: Number(feeDetail.examFee),
        lastMonthDue: Number(studentData.dueFee),
        extraClassesFee: Number(extraClassesFee),
        totalDue: Number(studentData.dueFee),
      });
    } else {
      // Update existing bill
      userBill.studentIds.push({ studentId: studentData._id });
      userBill.totalEducationFee =
        Number(userBill.totalEducationFee) + Number(feeDetail.fee);
      userBill.totalTransportFee =
        Number(userBill.totalTransportFee) + Number(studentData.transport);
      userBill.totalExamFee =
        Number(userBill.totalExamFee) + Number(feeDetail.examFee);
      userBill.extraClassesFee =
        Number(userBill.extraClassesFee) + Number(extraClassesFee);
      userBill.lastMonthDue =
        (userBill.studentIds.length == 1
          ? Number(studentData.dueFee)
          : Number(userBill.lastMonthDue)) + Number(studentData.dueFee);
      userBill.totalDue =
        (userBill.studentIds.length == 1
          ? Number(studentData.dueFee)
          : Number(userBill.totalDue)) + Number(studentData.dueFee);
    }

    // Single save operation
    await userBill.save();

    return NextResponse.json({
      status: 201,
      message: "Student added successfully",
    });
  } catch (error) {
    console.error("Error adding student:", error);
    return NextResponse.json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
