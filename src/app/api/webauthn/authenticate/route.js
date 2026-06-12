import { NextResponse } from "next/server";
import { generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import connectDB from "@/helper/connectDB";
import AdminDevice from "@/models/adminDeviceModel";

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
    await connectDB();
    const origin = request.headers.get("origin") || request.headers.get("referer") || "http://localhost:3000";
    const rpID = getRPID(origin);

    const userDevices = await AdminDevice.find({ userId: "admin" });

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userDevices.map(dev => ({
        id: Buffer.from(dev.credentialID, 'base64url'),
        type: "public-key",
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
    await connectDB();
    const body = await request.json();
    const expectedChallenge = request.cookies.get("webauthnChallenge")?.value;
    if (!expectedChallenge) {
      return NextResponse.json({ error: "Challenge expired or not found" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const rpID = getRPID(origin);

    // Find the device in DB
    const device = await AdminDevice.findOne({ credentialID: body.id });
    if (!device) {
      return NextResponse.json({ error: "Authenticator is not registered" }, { status: 400 });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: Buffer.from(device.credentialID, 'base64url'),
          credentialPublicKey: Buffer.from(device.credentialPublicKey, 'base64url'),
          counter: device.counter,
        },
      });
    } catch (error) {
      console.error("Verification logic error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
      // Update the counter
      device.counter = authenticationInfo.newCounter;
      await device.save();

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
