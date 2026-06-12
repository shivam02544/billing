import { NextResponse } from "next/server";
import { generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { connectDb } from "@/helper/connectDB";
import adminDeviceSchema from "@/models/adminDeviceModel";

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

    const origin = request.headers.get("origin") || request.headers.get("referer") || "http://localhost:3000";
    const rpID = getRPID(origin);

    const userDevices = await AdminDevice.find({ userId: "admin" });

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userDevices.map(dev => ({
        id: dev.credentialID, // v13 expects string
        type: "public-key",
        transports: dev.transports,
      })),
      userVerification: "preferred",
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
    console.error("Generate Auth Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = await connectDb();
    const AdminDevice = db.models.AdminDevice || db.model("AdminDevice", adminDeviceSchema);

    const body = await request.json();
    const expectedChallenge = request.cookies.get("webauthnChallenge")?.value;
    if (!expectedChallenge) {
      return NextResponse.json({ error: "Challenge expired or not found" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const rpID = getRPID(origin);

    const userDevices = await AdminDevice.find({ userId: "admin" });

    // Find the device in DB
    const authenticator = userDevices.find(dev => dev.credentialID === body.id);
    if (!authenticator) {
      return NextResponse.json({ error: "Authenticator is not registered" }, { status: 400 });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: authenticator.credentialID,
          publicKey: new Uint8Array(Buffer.from(authenticator.credentialPublicKey, 'base64url')),
          counter: authenticator.counter,
          transports: authenticator.transports,
        },
      });
    } catch (error) {
      console.error("Verification logic error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { verified, authenticationInfo } = verification;

    if (verified && authenticationInfo) {
      authenticator.counter = authenticationInfo.newCounter;
      await authenticator.save();

      const response = NextResponse.json({ verified: true });
      response.cookies.delete("webauthnChallenge");
      
      // Set the auth token as if they logged in manually
      const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      response.cookies.set("token", token, {
        expires,
        path: "/",
        sameSite: "strict"
      });

      return response;
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  } catch (error) {
    console.error("Verify Auth Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
