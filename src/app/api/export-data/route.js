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

    const students = await StudentSchema.find();
    if (!students.length) {
      return NextResponse.json({ status: 200, data: [] });
    }

    const studentIds = students.map((s) => s._id.toString());

    // Find bills where the first studentId in the array matches our active students
    // To ensure accurate mapping, we map over bills and find the corresponding student
    const bills = await StudentBillSchema.find({ "studentIds.studentId": { $in: studentIds } });

    // Create a map of student ID to their bill info
    const billMap = new Map();
    bills.forEach((bill) => {
      const sId = bill.studentIds?.[0]?.studentId;
      if (sId) {
        billMap.set(sId, bill);
      }
    });

    const exportData = students.map((student) => {
      const bill = billMap.get(student._id.toString());

      return {
        "Page ID": student.pageId || "N/A",
        "Student Name": student.name || "N/A",
        "Father Name": student.fatherName || "N/A",
        "Class": student.className || "N/A",
        "Contact": student.contact || "N/A",
        "Village": student.village || "N/A",
        "Total Education Fee": bill?.totalEducationFee || 0,
        "Transport Fee": bill?.totalTransportFee || 0,
        "Exam Fee": bill?.totalExamFee || 0,
        "Extra Classes Fee": bill?.extraClassesFee || 0,
        "Other Fee": bill?.otherFee || 0,
        "Total Due": bill?.totalDue || 0,
        "Paid Amount": bill?.paidAmount || 0,
      };
    });

    return NextResponse.json({ status: 200, data: exportData });
  } catch (error) {
    console.error("Error generating export data:", error);
    return NextResponse.json({ status: 500, message: "Failed to generate export data" });
  }
};
