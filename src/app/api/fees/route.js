import { connectDb } from "@/helper/connectDB";
import FeeSchema from "@/models/feeModel";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  await connectDb();
  const fees = await FeeSchema.find();
  return NextResponse.json({ status: 200, fees });
};
export const PUT = async (request) => {
  await connectDb();
  const { fees } = await request.json();
  console.log(fees);
  try {
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
