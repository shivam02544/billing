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
  try {
    await connectDb();
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
      isYearllyFee,
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
      transport: Number(transport || 0),
      dueFee: Number(dueFee || 0),
      extraClassesFee: Number(extraClassesFee || 0),
    });

    const studentData = await newStudent.save();
    if (isYearllyFee) {
      return NextResponse.json({
        status: 201,
        message: "Student added successfully",
      });
    }
    
    // Handle bill creation/update
    let userBill = await StudentBillSchema.findOne({ pageId });

    if (!userBill) {
      // Create new bill
      userBill = new StudentBillSchema({
        pageId: studentData.pageId,
        studentIds: [{ studentId: studentData._id }],
        totalEducationFee: Number(feeDetail.fee || 0),
        totalTransportFee: Number(studentData.transport || 0),
        totalExamFee: Number(feeDetail.examFee || 0),
        lastMonthDue: Number(studentData.dueFee || 0),
        extraClassesFee: Number(extraClassesFee || 0),
        totalDue: Number(studentData.dueFee || 0),
      });
    } else {
      // Update existing bill
      userBill.studentIds.push({ studentId: studentData._id });
      userBill.totalEducationFee =
        Number(userBill.totalEducationFee || 0) + Number(feeDetail.fee || 0);
      userBill.totalTransportFee =
        Number(userBill.totalTransportFee || 0) + Number(studentData.transport || 0);
      userBill.totalExamFee =
        Number(userBill.totalExamFee || 0) + Number(feeDetail.examFee || 0);
      userBill.extraClassesFee =
        Number(userBill.extraClassesFee || 0) + Number(extraClassesFee || 0);
      userBill.lastMonthDue =
        (userBill.studentIds.length === 1
          ? Number(studentData.dueFee || 0)
          : Number(userBill.lastMonthDue || 0)) + Number(studentData.dueFee || 0);
      userBill.totalDue =
        (userBill.studentIds.length === 1
          ? Number(studentData.dueFee || 0)
          : Number(userBill.totalDue || 0)) + Number(studentData.dueFee || 0);
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
