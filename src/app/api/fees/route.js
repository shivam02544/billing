import { connectDb } from "@/helper/connectDB";
import FeeSchema from "@/models/feeModel";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {
    await connectDb();
    const fees = await FeeSchema.find();
    return NextResponse.json({ status: 200, fees });
  } catch (error) {
    console.error("Error fetching fees:", error);
    return NextResponse.json({ status: 500, message: "Failed to fetch fees" });
  }
};

export const PUT = async (request) => {
  try {
    await connectDb();
    const { fees } = await request.json();
    
    if (!fees || !Array.isArray(fees)) {
      return NextResponse.json({
        status: 400,
        message: "Invalid fees data provided",
      });
    }
    
    console.log(fees);
    await FeeSchema.deleteMany({});
    await FeeSchema.insertMany(fees);
    return NextResponse.json({
      status: 200,
      message: "Fees updated successfully",
    });
  } catch (error) {
    console.error("Error updating fees:", error);
    return NextResponse.json({ status: 500, message: "Failed to update fees" });
  }
};
