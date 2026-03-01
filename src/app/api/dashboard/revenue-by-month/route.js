import { connectDb } from "@/helper/connectDB";
import studentBillSchema from "@/models/studentBillModel";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const db = await connectDb();
    const StudentBillSchema = db.models.StudentBillSchema || db.model("StudentBillSchema", studentBillSchema);

    const bills = await StudentBillSchema.find({}, { billPaymentHistory: 1 });

    const monthlyRevenue = Array(12).fill(0);

    bills.forEach((bill) => {
      if (bill.billPaymentHistory && bill.billPaymentHistory.length > 0) {
        bill.billPaymentHistory.forEach((payment) => {
          if (payment.date && payment.paidAmount) {
            const date = new Date(payment.date);
            const monthIndex = date.getMonth(); // 0 (Jan) to 11 (Dec)
            monthlyRevenue[monthIndex] += payment.paidAmount;
          }
        });
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = monthlyRevenue.map((amount, index) => ({
      month: monthNames[index],
      revenue: amount,
    }));

    return NextResponse.json({ status: 200, data: formattedData });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return NextResponse.json({ status: 500, message: "Failed to fetch monthly revenue" });
  }
};
