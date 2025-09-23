import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { is } from "date-fns/locale";

const publicRoutes = ["/login"];

const protectedRoutes = [
  "/",
  "/dashboard",
  "/extintores",
  "/inspecoes",
  "/manutencoes",
  "/alertas",
  "/relatorios",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("authToken")?.value;
  let isAuthenticated = false;
  if (token) {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
        await jwtVerify(token, secret);
        isAuthenticated = true;
    } catch (error) {
        isAuthenticated = false;
        console.error("JWT verification failed:", error);
    }
  }

  const isPublicRoute = publicRoutes.includes(pathname);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && (pathname === "/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
