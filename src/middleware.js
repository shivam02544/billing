import { NextResponse } from "next/server";

export async function middleware(request) {
  try {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get("token")?.value || null;

    // Allow API routes to pass through
    if (path.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Handle root path
    if (path === "/") {
      if (token === "nppsnauroo") {
        return NextResponse.redirect(new URL(`/searchStudent`, request.url));
      }
      return NextResponse.next();
    }

    // Check authentication for protected routes
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Validate token for protected routes
    if (token !== "nppsnauroo") {
      // Clear invalid token
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("token");
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, redirect to login
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/addNewStudent",
    "/searchStudent",
    "/About",
    "/generateBill",
    "/studentBills",
    "/api/:path*",
  ],
};
