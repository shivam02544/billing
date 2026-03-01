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

    // Aggregation for Billings matching the exact logic used in calculateTotalFees
    const billingSummary = await StudentBillSchema.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: { $toDouble: { $ifNull: ["$paidAmount", 0] } } },
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

    const aggData = billingSummary[0] || {};
    
    const stats = {
      totalCollected: aggData.totalCollected || 0,
      transportFee: aggData.totalTransportFee || 0,
      examFee: aggData.totalExamFee || 0,
    };
    
    // The total theoretically due based on all generated charges
    const totalStudentFeeGenerated = 
      (aggData.totalEduFee || 0) + 
      (aggData.totalTransportFee || 0) + 
      (aggData.totalExamFee || 0) + 
      (aggData.otherFee || 0) + 
      (aggData.extraClassesFee || 0);

    // Calculate actual outstanding (the mathematical current due given everything)
    stats.totalDue = totalStudentFeeGenerated - stats.totalCollected;
    // We explicitly cap it so it doesn't show negative if accidentally overpaid.
    if (stats.totalDue < 0) stats.totalDue = 0;

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
