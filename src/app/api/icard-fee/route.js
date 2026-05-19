import { connectDb } from "@/helper/connectDB";
import icardFeeSchema from "@/models/icardFeeModel";
import studentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — fetch all icard fee entries for a session
export const GET = async (request) => {
  try {
    const db = await connectDb();
    const IcardFee = db.models.IcardFee || db.model("IcardFee", icardFeeSchema);

    const { searchParams } = new URL(request.url);
    const session = searchParams.get("session") || "2026-2027";

    const records = await IcardFee.find({ session }).sort({ createdAt: -1 });
    return NextResponse.json({ statusCode: 200, data: records });
  } catch (error) {
    console.error("iCard Fee GET error:", error);
    return NextResponse.json({ statusCode: 500, message: error.message }, { status: 500 });
  }
};

// POST — add new icard fee entry
export const POST = async (request) => {
  try {
    const db = await connectDb();
    const IcardFee = db.models.IcardFee || db.model("IcardFee", icardFeeSchema);
    const StudentSchema = db.models.StudentSchema || db.model("StudentSchema", studentSchema);

    const body = await request.json();
    const { name, isTaken, isPaid, dueAmount, note, session } = body;

    if (!name) {
      return NextResponse.json({ statusCode: 400, message: "Name is required" }, { status: 400 });
    }

    // Try to find the student (read-only — for linking pageId only)
    const student = await StudentSchema.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    const newRecord = await IcardFee.create({
      name: name.trim(),
      studentPageId: student?.pageId || null,
      isTaken: !!isTaken,
      isPaid: !!isPaid,
      dueAmount: dueAmount || 0,
      note: note || "",
      session: session || "2026-2027",
    });

    return NextResponse.json({
      statusCode: 201,
      message: "iCard fee record saved",
      data: newRecord,
      studentFound: !!student,
    });
  } catch (error) {
    console.error("iCard Fee POST error:", error);
    return NextResponse.json({ statusCode: 500, message: error.message }, { status: 500 });
  }
};

// PATCH — update isTaken / isPaid / dueAmount / note
export const PATCH = async (request) => {
  try {
    const db = await connectDb();
    const IcardFee = db.models.IcardFee || db.model("IcardFee", icardFeeSchema);

    const body = await request.json();
    const { id, isTaken, isPaid, dueAmount, note } = body;

    if (!id) {
      return NextResponse.json({ statusCode: 400, message: "Record ID is required" }, { status: 400 });
    }

    const updated = await IcardFee.findByIdAndUpdate(
      id,
      { isTaken: !!isTaken, isPaid: !!isPaid, dueAmount: dueAmount || 0, note: note || "" },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ statusCode: 404, message: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ statusCode: 200, message: "Record updated", data: updated });
  } catch (error) {
    console.error("iCard Fee PATCH error:", error);
    return NextResponse.json({ statusCode: 500, message: error.message }, { status: 500 });
  }
};

// DELETE — remove a record
export const DELETE = async (request) => {
  try {
    const db = await connectDb();
    const IcardFee = db.models.IcardFee || db.model("IcardFee", icardFeeSchema);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ statusCode: 400, message: "ID is required" }, { status: 400 });
    }

    await IcardFee.findByIdAndDelete(id);
    return NextResponse.json({ statusCode: 200, message: "Record deleted" });
  } catch (error) {
    console.error("iCard Fee DELETE error:", error);
    return NextResponse.json({ statusCode: 500, message: error.message }, { status: 500 });
  }
};
