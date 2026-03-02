import { connectDb } from "@/helper/connectDB";
import studentSchema from "@/models/studentModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { status: 400, message: "Announcement message is required." },
        { status: 400 }
      );
    }

    const db = await connectDb();
    const StudentSchema = db.models.StudentSchema || db.model("StudentSchema", studentSchema);

    // Fetch all students
    const students = await StudentSchema.find({}, { contact: 1 });

    const phoneNumbersSet = new Set();

    students.forEach((student) => {
      if (student.contact) {
        // Split by separators: / , |
        const numbers = student.contact.split(/[\/,\|]/);
        numbers.forEach((num) => {
          const trimmed = num.trim();
          if (trimmed.length >= 10) { // basic validation
            phoneNumbersSet.add(trimmed);
          }
        });
      }
    });

    const uniquePhoneNumbers = Array.from(phoneNumbersSet);

    if (uniquePhoneNumbers.length === 0) {
      return NextResponse.json(
        { status: 404, message: "No valid phone numbers found in the database." },
        { status: 404 }
      );
    }

    const username = process.env.SMS_GATE_USERNAME;
    const password = process.env.SMS_GATE_PASSWORD;
    const baseUrl = process.env.SMS_GATE_BASE_URL || "https://api.sms-gate.app/3rdparty/v1/messages";

    if (!username || !password) {
      console.error("SMS API Credentials not configured in .env.local");
      return NextResponse.json(
        { status: 500, message: "SMS Service is not configured properly." },
        { status: 500 }
      );
    }

    // Ensure phone numbers start with +91
    const formattedPhoneNumbers = uniquePhoneNumbers.map(num => {
      let strNum = String(num).replace(/[^0-9+]/g, ''); // remove non-numeric or non-plus
      if (strNum.startsWith('+91')) return strNum;
      if (strNum.startsWith('91') && strNum.length === 12) return '+' + strNum;
      return '+91' + strNum.replace(/^\+/, ''); // Default to India code
    });

    // The user wants a formal message with a do not reply notice
    const finalMessage = `${message.trim()}\n\nNew Progressive Public School, Nauroo\nJehanabad.\n(यह एक स्वचालित संदेश है, कृपया इसका उत्तर न दें।)\n~Antesh Sir`;

    // Construct the payload
    const payload = {
      phoneNumbers: formattedPhoneNumbers,
      textMessage: {
        text: finalMessage
      }
    };

    // Create Basic Auth Token
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

    // Send the request
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("SMS Gateway Error:", result);
      return NextResponse.json(
        { status: response.status, message: result.message || "Failed to send SMS." },
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      status: 200, 
      message: "Announcement sent successfully.", 
      recipientsCount: formattedPhoneNumbers.length 
    });

  } catch (error) {
    console.error("Error sending announcement:", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error during announcement dispatch." },
      { status: 500 }
    );
  }
}
