import { connectDb } from "@/helper/connectDB";
import SchoolFeeCartSchema from "@/models/schoolFeeCart";
import StudentBillSchema from "@/models/studentBillModel";

import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
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

    const currentMonth = months[bills[0].billGeneratedMonth];
    const currentYear = new Date().getFullYear();
    const formattedMonth = `${currentMonth} ${currentYear}`;

    // Check if a record for this month already exists
    const existingRecord = await SchoolFeeCartSchema.findOne({
      month: formattedMonth,
    });

    if (existingRecord) {
      // Update existing record
      existingRecord.totalDuesFee = totalStudentFee;
      existingRecord.totalPaidFee = totalPaidFee;
      await existingRecord.save();
    } else {
      // Create new record
      await SchoolFeeCartSchema.create({
        month: formattedMonth,
        totalDuesFee: totalStudentFee,
        totalPaidFee: totalPaidFee,
      });
    }

    return NextResponse.json({
      status: 200,
      totalStudentFee,
      totalPaidFee,
      formattedMonth,
      message: existingRecord
        ? "Monthly fee data updated"
        : "New monthly fee data saved",
    });
  } catch (error) {
    console.error("Error calculating total fee:", error);
    return NextResponse.json({
      status: 500,
      message: "Failed to calculate or save total fee",
    });
  }
};
