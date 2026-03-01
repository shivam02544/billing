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

    // Aggregation for Total Students directly from Student schema
    const totalStudentsResult = await StudentSchema.aggregate([
      { $count: "count" }
    ]);
    const totalStudents = totalStudentsResult[0]?.count || 0;

    // Aggregation for Billings
    const billingSummary = await StudentBillSchema.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: { $toDouble: { $ifNull: ["$paidAmount", 0] } } },
          totalDue: { $sum: { $toDouble: { $ifNull: ["$totalDue", 0] } } },
          transportFee: { $sum: { $toDouble: { $ifNull: ["$totalTransportFee", 0] } } },
          examFee: { 
            $sum: { 
              $cond: [
                { $eq: ["$isExamFeeAdded", true] }, 
                { $toDouble: { $ifNull: ["$totalExamFee", 0] } }, 
                0
              ] 
            } 
          },
        }
      }
    ]);

    const stats = billingSummary[0] || {
      totalCollected: 0,
      totalDue: 0,
      transportFee: 0,
      examFee: 0
    };

    return NextResponse.json({
      totalStudents,
      totalCollected: stats.totalCollected,
      totalDue: stats.totalDue,
      transportFee: stats.transportFee,
      examFee: stats.examFee,
    }, { status: 200 });

  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
