import { NextResponse } from "next/server";
import { connectDb } from "@/helper/connectDB";
import FeeSchema from "@/models/feeModel";
import StudentBillSchema from "@/models/studentBillModel";

export const GET = async () => {
  try {
    await connectDb();

    // Fetch all student bills
    const bills = await StudentBillSchema.find();
    if (!bills.length) {
      return NextResponse.json({ status: 200, data: [] });
    }

    // Calculate total due and paid fee
    let totalStudentFee = 0;
    let totalPaidFee = 0;

    bills.forEach((bill) => {
      const edu = Number(bill.totalEducationFee || 0);
      const trans = Number(bill.totalTransportFee || 0);
      const exam = bill.isExamFeeAdded ? Number(bill.totalExamFee || 0) : 0;
      const other = Number(bill.otherFee || 0);
      const extra = Number(bill.extraClassesFee || 0);
      totalPaidFee += Number(bill.paidAmount || 0);
      totalStudentFee += edu + trans + exam + other + extra;
    });

    // Fetch all fee details
    const feeDetails = await FeeSchema.find();

    // Calculate total fee for each class
    const feeSummary = {};
    feeDetails.forEach((fee) => {
      const className = fee.className;
      const totalFee = Number(fee.fee || 0) + Number(fee.examFee || 0);
      feeSummary[className] = totalFee;
    });

    return NextResponse.json({
      status: 200,
      totalStudentFee,
      totalPaidFee,
      feeSummary,
    });
  } catch (error) {
    console.error("Error fetching fee summary:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
};
