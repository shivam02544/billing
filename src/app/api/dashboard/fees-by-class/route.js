import { connectDb } from "@/helper/connectDB";
import feeSchema from "@/models/feeModel";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const db = await connectDb();
    const FeeSchema = db.models.FeeSchema || db.model("FeeSchema", feeSchema);

    // Fetch the standard fees for each class out of the Fee Schema
    const classesFees = await FeeSchema.find({}).sort({ fee: -1 }).lean();

    const formattedData = classesFees.map((item) => ({
      className: item.className || "Unknown",
      fee: Number(item.fee || 0),
    }));

    return NextResponse.json(formattedData, { status: 200 });

  } catch (error) {
    console.error("Dashboard Bar Data Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
