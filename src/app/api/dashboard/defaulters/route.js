import { connectDb } from "@/helper/connectDB";
import studentBillSchema from "@/models/studentBillModel";
import studentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const db = await connectDb();
    const StudentBillSchema = db.models.StudentBillSchema || db.model("StudentBillSchema", studentBillSchema);
    const StudentSchema = db.models.StudentSchema || db.model("StudentSchema", studentSchema);

    // Find bills where totalDue > 0 and sort descending by totalDue
    const topDefaulterBills = await StudentBillSchema.find({ totalDue: { $gt: 0 } })
      .sort({ totalDue: -1 })
      .limit(10); // get top 10

    if (!topDefaulterBills.length) {
      return NextResponse.json({ status: 200, data: [] });
    }

    const studentIds = topDefaulterBills
      .map((bill) => bill.studentIds?.[0]?.studentId)
      .filter(Boolean);

    const students = await StudentSchema.find({ _id: { $in: studentIds } });
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    const defaultersData = topDefaulterBills
      .map((bill) => {
        const student = studentMap.get(bill.studentIds?.[0]?.studentId);
        if (!student) return null;

        return {
          studentId: student._id,
          name: student.name,
          className: student.className,
          fatherName: student.fatherName,
          contact: student.contact || "N/A",
          totalDue: bill.totalDue,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ status: 200, data: defaultersData });
  } catch (error) {
    console.error("Error fetching defaulters:", error);
    return NextResponse.json({ status: 500, message: "Failed to fetch defaulters" });
  }
};
