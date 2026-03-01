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
      // If there is a detailed payment history, use it for exact dates
      if (bill.billPaymentHistory && bill.billPaymentHistory.length > 0) {
        bill.billPaymentHistory.forEach((payment) => {
          if (payment.date && payment.paidAmount) {
            const date = new Date(payment.date);
            const monthIndex = date.getMonth(); // 0 (Jan) to 11 (Dec)
            monthlyRevenue[monthIndex] += Number(payment.paidAmount) || 0;
          }
        });
      } else if (bill.paidAmount && Number(bill.paidAmount) > 0) {
        // Fallback: If no history exists but an amount was paid, attribute it to the bill's generated month, or current month
        const monthIndex = bill.billGeneratedMonth !== undefined && bill.billGeneratedMonth !== null 
          ? Number(bill.billGeneratedMonth) 
          : new Date().getMonth();
        
        if (monthIndex >= 0 && monthIndex <= 11) {
          monthlyRevenue[monthIndex] += Number(bill.paidAmount) || 0;
        }
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
