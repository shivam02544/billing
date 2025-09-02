import { NextResponse } from "next/server";
import FeeSchema from "@/models/feeSchema";
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
      const edu = bill.totalEducationFee || 0;
      const trans = bill.totalTransportFee || 0;
      const exam = bill.isExamFeeAdded ? bill.totalExamFee || 0 : 0;
      const other = bill.otherFee || 0;
      const extra = bill.extraClassesFee || 0;
      totalPaidFee += bill.paidAmount || 0;
      totalStudentFee += edu + trans + exam + other + extra;
    });

    // Fetch all fee details
    const feeDetails = await FeeSchema.find();

    // Calculate total fee for each class
    const feeSummary = {};
    feeDetails.forEach((fee) => {
      const className = fee.className;
      const totalFee = fee.fee + fee.examFee;
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
