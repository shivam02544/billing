import { NextResponse } from "next/server";
export async function middleware(request) {
  const path = await request.nextUrl.pathname;
  const token = (await request.cookies.get("token")?.value) || null;

  if (path === "/api/studentsCrud") {
    return NextResponse.next();
  }

  if (path === "/") {
    if (token == "npps6284@nauroo") {
      return NextResponse.redirect(new URL(`/searchStudent`, request.url));
    }
    return NextResponse.next();
  } else {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
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
