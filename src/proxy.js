import { NextResponse } from "next/server";

export function proxy(request) {
  try {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get("token")?.value || null;

    // Define which routes require authentication
    const protectedRoutes = [
      "/dashboard",
      "/addNewStudent",
      "/studentBills",
      "/getStudentsBill",
      "/export-data",
      "/generateBill",
      "/payBill",
      "/important-fees",
      "/announcement",
      "/About"
    ];

    const isProtectedRoute = protectedRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );

    // Handle root path (Login page)
    if (path === "/") {
      if (token) {
        return NextResponse.redirect(new URL(`/searchStudent`, request.url));
      }
      return NextResponse.next();
    }

    // Check authentication for protected routes and API routes
    if (!token) {
      if (path.startsWith("/api/")) {
        // Exclude specific public APIs if needed. For now, we block all API routes except GETs or if explicitly configured.
        // If /api/studentsCrud is needed for public search, we should whitelist it.
        if (path === "/api/studentsCrud" && request.method === "GET") {
          return NextResponse.next();
        }
        return NextResponse.json({ status: 401, message: "Unauthorized. Please log in." }, { status: 401 });
      }
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("token");
        return response;
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ status: 500, message: "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
