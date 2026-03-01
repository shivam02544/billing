import mongoose from "mongoose";
import { connectDb } from "@/helper/connectDB";
import { NextResponse } from "next/server";
import studentSchema from "@/models/studentModel";
import feeSchema from "@/models/feeModel";

export async function POST(req) {
  try {
    const { sourceSession, targetSession } = await req.json();

    if (!sourceSession || !targetSession) {
      return NextResponse.json({ error: "Source and target sessions are required" }, { status: 400 });
    }

    if (!process.env.DB_URL) {
      return NextResponse.json({ error: "Database URL is not configured" }, { status: 500 });
    }

    // Connect to source database
    // We mock the cookies momentarily inside the helper, or we can just access connection via createConnection
    const url = process.env.DB_URL;
    
    const dbBaseName = "newnpps";
    const sourceDbName = sourceSession === "2025-2026" ? dbBaseName : `npps${sourceSession}`;
    const targetDbName = targetSession === "2025-2026" ? dbBaseName : `npps${targetSession}`;

    console.log(`Migrating data from ${sourceDbName} to ${targetDbName}...`);

    const dbSource = mongoose.createConnection(url, { dbName: sourceDbName });
    const dbTarget = mongoose.createConnection(url, { dbName: targetDbName });

    // Build Specific Connections Models
    const SourceStudent = dbSource.models.StudentSchema || dbSource.model("StudentSchema", studentSchema);
    const SourceFee = dbSource.models.FeeSchema || dbSource.model("FeeSchema", feeSchema);

    const TargetStudent = dbTarget.models.StudentSchema || dbTarget.model("StudentSchema", studentSchema);
    const TargetFee = dbTarget.models.FeeSchema || dbTarget.model("FeeSchema", feeSchema);

    // Check if target DB already has data
    const existingStudentsCount = await TargetStudent.countDocuments();
    if (existingStudentsCount > 0) {
      return NextResponse.json({ 
        message: `Session ${targetSession} already has ${existingStudentsCount} students. Migration skipped to prevent duplicates.`,
        success: false
      });
    }

    // Fetch data from source DB
    const students = await SourceStudent.find({}).lean();
    const fees = await SourceFee.find({}).lean();

    // Prepare data for insertion (strip _id and set specific fields like dueFee to 0)
    const newStudents = students.map((s) => {
      const { _id, createdAt, updatedAt, ...rest } = s;
      return {
        ...rest,
        session: targetSession, // Set to new session
        dueFee: 0,              // Reset due fee
        extraClassesFee: 0      // Reset extra classes fee
      };
    });

    const newFees = fees.map((f) => {
      const { _id, createdAt, updatedAt, ...rest } = f;
      return rest;
    });

    // Insert into target DB
    if (newStudents.length > 0) {
      await TargetStudent.insertMany(newStudents);
    }
    
    if (newFees.length > 0) {
      await TargetFee.insertMany(newFees);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully migrated ${newStudents.length} students and ${newFees.length} fee structures from ${sourceSession} to ${targetSession}.`
    });

  } catch (error) {
    console.error("Migration Error:", error);
    return NextResponse.json({ error: error.message || "Failed to migrate session data" }, { status: 500 });
  }
}
