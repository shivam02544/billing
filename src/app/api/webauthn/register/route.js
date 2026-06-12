import { NextResponse } from "next/server";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import { connectDb } from "@/helper/connectDB";
import adminDeviceSchema from "@/models/adminDeviceModel";

const rpName = "NPPS Billing System";
// We rely on the origin of the request to define RP ID
function getRPID(origin) {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch (e) {
    return "localhost";
  }
}

export async function GET(request) {
  try {
    const db = await connectDb();
    const AdminDevice = db.models.AdminDevice || db.model("AdminDevice", adminDeviceSchema);

    const token = request.cookies.get("token")?.value;
    if (token !== process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const origin = request.headers.get("origin") || request.headers.get("referer") || "http://localhost:3000";
    const rpID = getRPID(origin);

    const userDevices = await AdminDevice.find({ userId: "admin" });

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from("admin")), // userID must be Uint8Array in v10+
      userName: "admin",
      attestationType: "none",
      excludeCredentials: userDevices.map(dev => ({
        id: dev.credentialID,
        type: "public-key",
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    const response = NextResponse.json(options);
    response.cookies.set("webauthnChallenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 300, // 5 minutes
    });

    return response;
  } catch (error) {
    console.error("Generate Registration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = await connectDb();
    const AdminDevice = db.models.AdminDevice || db.model("AdminDevice", adminDeviceSchema);

    const token = request.cookies.get("token")?.value;
    if (token !== process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const expectedChallenge = request.cookies.get("webauthnChallenge")?.value;
    if (!expectedChallenge) {
      return NextResponse.json({ error: "Challenge expired or not found" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const rpID = getRPID(origin);

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
      console.error("Verification logic error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
      
      const newDevice = new AdminDevice({
        userId: "admin",
        credentialID: credential.id, // v13 returns base64url string
        credentialPublicKey: Buffer.from(credential.publicKey).toString('base64url'), // v13 returns Uint8Array
        counter: credential.counter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: credential.transports || [],
      });

      await newDevice.save();

      const response = NextResponse.json({ verified: true });
      response.cookies.delete("webauthnChallenge");
      return response;
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  } catch (error) {
    console.error("Verify Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
