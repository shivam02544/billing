import { connectDb } from "@/helper/connectDB";
import StudentBillSchema from "@/models/studentBillModel";
import StudentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";
export const GET = async () => {
  try {
    await connectDb();
    const bills = await StudentBillSchema.find();
    const bill = await Promise.all(
      bills.map(async (billDetail) => {
        const studentDetail = await StudentSchema.findById(
          billDetail.studentIds[0].studentId
        );
        return {
          pageId: studentDetail.pageId,
          name: studentDetail.name,
          className: studentDetail.className,
          parent: studentDetail.fatherName,
          village: studentDetail.village,
          tuitionFee: billDetail.totalEducationFee,
          transportFee: billDetail.totalTransportFee,
          examFee: billDetail.totalExamFee,
          isExamFeeAdded: billDetail.isExamFeeAdded,
          otherFee: billDetail.otherFee,
          otherFeeMessage: billDetail.otherFeeMessage,
          billGeneratedMonth: billDetail.billGeneratedMonth,
          totalDue: billDetail.totalDue,
          lastMonthDue: billDetail.lastMonthDue,
        };
      })
    );
    bill.sort((a, b) => {
      const classNameOrder = [
        "PRE-NC",
        "LKG",
        "UKG",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
      ];
      return (
        classNameOrder.indexOf(a.className) -
        classNameOrder.indexOf(b.className)
      );
    });

    return NextResponse.json({
      status: 200,
      data: bill,
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json({
      status: 500,
      message: "Failed to get bills",
    });
  }
};

export const POST = async (request) => {
  try {
    await connectDb();
    const body = await request.json();
    const bills = await StudentBillSchema.find();

    const monthNumber = new Date().getMonth();

    for (const bill of bills) {
      if (bill.billGeneratedMonth != monthNumber) {
        bill.otherFee = body.otherFee * bill.studentIds.length;

        bill.isExamFeeAdded = body.addExamFee;
        bill.lastMonthDue = bill.totalDue;
        bill.totalDue =
          bill.totalEducationFee +
          bill.totalTransportFee +
          bill.otherFee +
          bill.lastMonthDue +
          (bill.isExamFeeAdded ? bill.totalExamFee : 0);

        bill.billGeneratedMonth = monthNumber;
        bill.otherFeeMessage = body.otherFeeMessage;
        if (bill.paidAmount == 0) {
          let currentHistory = {
            totalEducationFee: bill.totalEducationFee,
            totalTransportFee: bill.totalTransportFee,
            totalExamFee: bill.isExamFeeAdded ? bill.totalExamFee : 0,
            otherFee: bill.otherFee,
            otherFeeMessage: bill.otherFeeMessage,
            totalDue: bill.totalDue,
            lastMonthDue: bill.lastMonthDue,
            paidAmount: 0,
            paymentMode: "--",
          };
          bill.billPaymentHistory.push(currentHistory);
        }
        bill.paidAmount = 0;
        await bill.save();
      }
    }

    return NextResponse.json({
      status: 201,
      message: "Bill created successfully",
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    return NextResponse.json({
      status: 500,
      message: "Failed to create bill",
    });
  }
};
