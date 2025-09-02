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
      const edu = Number(bill.totalEducationFee || 0);
      const trans = Number(bill.totalTransportFee || 0);
      const exam = bill.isExamFeeAdded ? Number(bill.totalExamFee || 0) : 0;
      const other = Number(bill.otherFee || 0);
      const extra = Number(bill.extraClassesFee || 0);
      totalPaidFee += Number(bill.paidAmount || 0);
      totalStudentFee += edu + trans + exam + other + extra;
    });

    // Validate bill data before accessing
    if (!bills[0] || bills[0].billGeneratedMonth === undefined) {
      return NextResponse.json({
        status: 400,
        message: "Invalid bill data found",
      });
    }

    const currentMonth = months[Number(bills[0].billGeneratedMonth) || 0];
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
