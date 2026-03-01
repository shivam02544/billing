import { NextResponse } from "next/server";

export async function proxy(request) {
  try {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get("token")?.value || null;
    const adminToken = process.env.ADMIN_TOKEN;

    // Handle root path
    if (path === "/") {
      if (token === adminToken) {
        return NextResponse.redirect(new URL(`/searchStudent`, request.url));
      }
      return NextResponse.next();
    }

    // Check authentication for protected routes and API routes
    if (!token || token !== adminToken) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ status: 401, message: "Unauthorized" }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("token");
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Proxy error:", error);
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ status: 500, message: "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/addNewStudent",
    "/searchStudent",
    "/About",
    "/generateBill",
    "/studentBills",
    "/api/:path*",
  ],
};
