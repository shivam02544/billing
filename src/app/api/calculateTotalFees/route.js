import { connectDb } from "@/helper/connectDB";
import schoolFeeCartSchema from "@/models/schoolFeeCart";
import studentBillSchema from "@/models/studentBillModel";

export const dynamic = "force-dynamic";
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
    const db = await connectDb();
    const StudentBillSchema = db.models.StudentBillSchema || db.model("StudentBillSchema", studentBillSchema);
    const SchoolFeeCartSchema = db.models.SchoolFeeCartSchema || db.model("SchoolFeeCartSchema", schoolFeeCartSchema);

    // Use aggregation to calculate total fees efficiently in DB instead of memory
    const result = await StudentBillSchema.aggregate([
      {
        $group: {
          _id: null,
          totalPaidFee: { $sum: { $toDouble: { $ifNull: ["$paidAmount", 0] } } },
          totalEduFee: { $sum: { $toDouble: { $ifNull: ["$totalEducationFee", 0] } } },
          totalTransportFee: { $sum: { $toDouble: { $ifNull: ["$totalTransportFee", 0] } } },
          totalExamFee: { 
            $sum: { 
              $cond: [
                { $eq: ["$isExamFeeAdded", true] }, 
                { $toDouble: { $ifNull: ["$totalExamFee", 0] } }, 
                0
              ] 
            } 
          },
          otherFee: { $sum: { $toDouble: { $ifNull: ["$otherFee", 0] } } },
          extraClassesFee: { $sum: { $toDouble: { $ifNull: ["$extraClassesFee", 0] } } }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return NextResponse.json({ status: 200, data: [] });
    }

    const aggData = result[0];
    const totalPaidFee = aggData.totalPaidFee || 0;
    const totalStudentFee = 
      (aggData.totalEduFee || 0) + 
      (aggData.totalTransportFee || 0) + 
      (aggData.totalExamFee || 0) + 
      (aggData.otherFee || 0) + 
      (aggData.extraClassesFee || 0);

    // Get a sample document just to find the latest bill generation month
    const oneBill = await StudentBillSchema.findOne().select("billGeneratedMonth");
    if (!oneBill || oneBill.billGeneratedMonth === undefined) {
      return NextResponse.json({
        status: 400,
        message: "Invalid bill data found",
      });
    }

    const currentMonth = months[Number(oneBill.billGeneratedMonth) || 0];
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
