import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { studentName, totalDue, phoneNumbers } = await req.json();

    if (!studentName || totalDue === undefined || !phoneNumbers || phoneNumbers.length === 0) {
      return NextResponse.json(
        { status: 400, message: "Missing required fields: studentName, totalDue or phoneNumbers." },
        { status: 400 }
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

    // Compose the Formal Hindi Message
    const hindiMessage = `प्रिय अभिभावक ,\n\nविद्यार्थी ${studentName} के ऊपर कुल ₹${totalDue} स्कूल फीस बाकी है। आपसे अनुरोध है कि कृपया समय से फीस जमा कर दीजिए, ताकि आगे किसी तरह की परेशानी न हो।\n\nधन्यवाद।\nNew Progressive Public School, Nauroo\nJehanabad.\n(यह एक स्वचालित संदेश है, कृपया इसका उत्तर न दें।)\n~Antesh Sir`;

    // Ensure phone numbers start with +91
    const formattedPhoneNumbers = phoneNumbers.map(num => {
      let strNum = String(num).trim();
      if (strNum.startsWith('+91')) return strNum;
      if (strNum.startsWith('91') && strNum.length === 12) return '+' + strNum;
      return '+91' + strNum.replace(/^\+/, ''); // In case they typed just "+" followed by wrong digits
    });

    // Construct the payload as per smsgateway.Message schema
    const payload = {
      phoneNumbers: formattedPhoneNumbers,
      textMessage: {
        text: hindiMessage
      }
    };

    // Create Basic Auth Token
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

    // Send the request to sms-gate.app
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

    return NextResponse.json({ status: 200, message: "SMS notification sent successfully." });

  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error during SMS dispatch." },
      { status: 500 }
    );
  }
}
