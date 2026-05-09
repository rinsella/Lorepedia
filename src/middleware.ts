import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe NextAuth instance (no Prisma adapter pulled in).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isAuthed = !!req.auth?.user;
  const role = (req.auth?.user as any)?.role as string | undefined;

  if (/^\/(dashboard|admin|superadmin)(\/.*)?$/.test(path) && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }
  if (path.startsWith("/admin") && !["ADMIN", "SUPERADMIN", "MODERATOR"].includes(role ?? "")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  if (path.startsWith("/superadmin") && role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/superadmin/:path*"],
};
