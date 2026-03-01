import { connectDb } from "@/helper/connectDB";
import studentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const db = await connectDb();
    const StudentSchema = db.models.StudentSchema || db.model("StudentSchema", studentSchema);

    const studentCounts = await StudentSchema.aggregate([
      {
        $group: {
          _id: "$className",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          className: { $ifNull: ["$_id", "Unknown"] },
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { className: 1 },
      },
    ]);

    return NextResponse.json(studentCounts, { status: 200 });
  } catch (error) {
    console.error("Dashboard Students By Class Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
