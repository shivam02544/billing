import { connectDb } from "@/helper/connectDB";
import studentBillSchema from "@/models/studentBillModel";
import studentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const db = await connectDb();
    const StudentBillSchema =
      db.models.StudentBillSchema || db.model("StudentBillSchema", studentBillSchema);
    const StudentSchema =
      db.models.StudentSchema || db.model("StudentSchema", studentSchema);

    // Fetch ALL bills with totalDue > 0, sorted descending
    const allDefaulterBills = await StudentBillSchema.find({ totalDue: { $gt: 0 } }).sort({
      totalDue: -1,
    });

    if (!allDefaulterBills.length) {
      return NextResponse.json({ status: 200, data: [] });
    }

    // Collect every studentId referenced in all defaulter bills
    const allStudentIds = [];
    allDefaulterBills.forEach((bill) => {
      (bill.studentIds || []).forEach((entry) => {
        if (entry.studentId) allStudentIds.push(entry.studentId);
      });
    });

    // Bulk fetch students
    const students = await StudentSchema.find({ _id: { $in: allStudentIds } });
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    // Build grouped defaulters – one entry per pageId (bill), with all siblings
    const defaultersData = allDefaulterBills
      .map((bill) => {
        const siblings = (bill.studentIds || [])
          .map((entry) => {
            const s = studentMap.get(entry.studentId);
            if (!s) return null;
            return {
              studentId: s._id.toString(),
              name: s.name,
              className: s.className,
              fatherName: s.fatherName,
              village: s.village,
            };
          })
          .filter(Boolean);

        if (siblings.length === 0) return null;

        // Use first student's contact (siblings share it)
        const primaryStudent = studentMap.get(bill.studentIds?.[0]?.studentId);
        const contact = primaryStudent?.contact || "N/A";
        const fatherName = primaryStudent?.fatherName || "";
        const village = primaryStudent?.village || "";

        return {
          pageId: bill.pageId,
          totalDue: bill.totalDue,
          paidAmount: bill.paidAmount || 0,
          lastMonthDue: bill.lastMonthDue || 0,
          contact,
          fatherName,
          village,
          siblings,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ status: 200, data: defaultersData });
  } catch (error) {
    console.error("Error fetching all defaulters:", error);
    return NextResponse.json({ status: 500, message: "Failed to fetch defaulters" });
  }
};
