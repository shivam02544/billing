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
    const name = searchParams.get("name");
    if (pageId && name) {
      const studentDetail = await StudentSchema.findOne({ pageId, name });
      return NextResponse.json({
        statusCode: 200,
        data: studentDetail,
      });
    }

    const students = await StudentSchema.find();
    return NextResponse.json({
      statusCode: 200,
      data: students,
    });
  } catch (error) {
    return NextResponse({
      statusCode: 500,
      data: { error: error.message },
    });
  }
};

export const PUT = async (request) => {
  try {
    await connectDb();
    const body = await request.json();
    const student = await StudentSchema.findById(body.studentId);
    if (!student) {
      return NextResponse.json({
        statusCode: 404,
        message: "Student not found",
      });
    }
    let newFee = await FeeSchema.findOne({ className: body.className });
    let oldFee = await FeeSchema.findOne({ className: student.className });

    if (!newFee || !oldFee) {
      return NextResponse.json({
        statusCode: 404,
        message: "Fee structure not found for the specified class",
      });
    }
    let diffFee = Number(oldFee.fee) - Number(newFee.fee);
    let diffExamFee = Number(oldFee.examFee) - Number(newFee.examFee);
    let transportDiff = Number(student.transport) - Number(body.transport);
    // Update student's details
    student.className = body.className;
    student.name = body.name;
    student.village = body.village;
    student.district = body.district;
    student.dob = body.dob;
    student.fatherName = body.fatherName;
    student.motherName = body.motherName;
    student.contact = body.contact;
    student.transport = Number(body.transport);
    await student.save();

    // Update the class fee, transport fee, and due fee in the student bill if class is changed

    const bill = await StudentBillSchema.findOne({ pageId: student.pageId });
    if (bill) {
      bill.totalEducationFee = Number(bill.totalEducationFee) - Number(diffFee);
      bill.totalTransportFee =
        Number(bill.totalTransportFee) - Number(transportDiff);
      bill.totalExamFee = Number(bill.totalExamFee) - Number(diffExamFee);
      await bill.save();
    }

    return NextResponse.json({
      statusCode: 200,
      message: "Student's details updated successfully",
    });
  } catch (error) {
    console.error("Error updating student's details:", error);
    return NextResponse.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};

export const DELETE = async (request) => {
  try {
    await connectDb();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    console.log(studentId);

    if (!studentId) {
      return NextResponse.json({
        statusCode: 400,
        message: "Student ID is required",
      });
    }

    const student = await StudentSchema.findByIdAndDelete(studentId);
    if (!student) {
      return NextResponse.json({
        statusCode: 404,
        message: "Student not found",
      });
    }

    // Subtract student's fees from the bill
    const feeDetail = await FeeSchema.findOne({ className: student.className });
    const bill = await StudentBillSchema.findOne({ pageId: student.pageId });

    if (bill) {
      bill.totalEducationFee =
        Number(bill.totalEducationFee) - Number(feeDetail.fee);
      bill.totalTransportFee =
        Number(bill.totalTransportFee) - Number(student.transport);
      bill.totalExamFee = Number(bill.totalExamFee) - Number(feeDetail.examFee);
      bill.studentIds = bill.studentIds.filter(
        (obj) => obj.studentId !== studentId.toString()
      );

      await bill.save();
    }
    return NextResponse.json({
      statusCode: 200,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};
