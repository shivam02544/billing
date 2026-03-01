import { connectDb } from "@/helper/connectDB";
import dynamicFeeSchema from "@/models/dynamicFeeModel";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const db = await connectDb();
    const DynamicFeeSchema = db.models.DynamicFeeSchema || db.model("DynamicFeeSchema", dynamicFeeSchema);

    const fees = await DynamicFeeSchema.find().sort({ createdAt: -1 });

    return NextResponse.json({ status: 200, data: fees });
  } catch (error) {
    console.error("Error fetching dynamic fees:", error);
    return NextResponse.json({ status: 500, message: "Failed to fetch fees" });
  }
};

export const POST = async (request) => {
  try {
    const db = await connectDb();
    const DynamicFeeSchema = db.models.DynamicFeeSchema || db.model("DynamicFeeSchema", dynamicFeeSchema);
    
    const body = await request.json();
    const { name, amount, description, isActive } = body;

    if (!name || amount === undefined) {
      return NextResponse.json({ status: 400, message: "Name and amount are required" });
    }

    const existingFee = await DynamicFeeSchema.findOne({ name });
    if (existingFee) {
       return NextResponse.json({ status: 400, message: "Fee with this name already exists" });
    }

    const newFee = new DynamicFeeSchema({
      name,
      amount: Number(amount),
      description: description || "",
      isActive: isActive !== false // default to true
    });

    await newFee.save();

    return NextResponse.json({ status: 201, message: "Fee created successfully", data: newFee });
  } catch (error) {
    console.error("Error creating dynamic fee:", error);
    return NextResponse.json({ status: 500, message: "Failed to create fee" });
  }
};

export const PUT = async (request) => {
  try {
    const db = await connectDb();
    const DynamicFeeSchema = db.models.DynamicFeeSchema || db.model("DynamicFeeSchema", dynamicFeeSchema);
    
    const body = await request.json();
    const { id, name, amount, description, isActive } = body;

    if (!id) {
       return NextResponse.json({ status: 400, message: "Fee ID is required for update" });
    }

    const updatedFee = await DynamicFeeSchema.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );

    if (!updatedFee) {
        return NextResponse.json({ status: 404, message: "Fee not found" });
    }

    return NextResponse.json({ status: 200, message: "Fee updated successfully", data: updatedFee });
  } catch (error) {
    console.error("Error updating dynamic fee:", error);
    return NextResponse.json({ status: 500, message: "Failed to update fee" });
  }
};

export const DELETE = async (request) => {
  try {
    const db = await connectDb();
    const DynamicFeeSchema = db.models.DynamicFeeSchema || db.model("DynamicFeeSchema", dynamicFeeSchema);
    
    // Parse the ID from the URL or body. Using search params as standard for DELETE.
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
       return NextResponse.json({ status: 400, message: "Fee ID is required for deletion" });
    }

    const deletedFee = await DynamicFeeSchema.findByIdAndDelete(id);

    if (!deletedFee) {
        return NextResponse.json({ status: 404, message: "Fee not found" });
    }

    return NextResponse.json({ status: 200, message: "Fee deleted successfully" });
  } catch (error) {
    console.error("Error deleting dynamic fee:", error);
    return NextResponse.json({ status: 500, message: "Failed to delete fee" });
  }
};
