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

  // Verifica se existe token (sem validar JWT aqui, deixa para o AuthContext)
  const token = request.cookies.get("authToken")?.value || 
                request.headers.get("authorization")?.replace("Bearer ", "");
  
  const isAuthenticated = !!token; // Se tem token, considera autenticado
  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Se é rota protegida e não está autenticado, redireciona para login
  if (isProtectedRoute && !isAuthenticated && !isPublicRoute) {
    console.log(`Redirecting to login from ${pathname} - no token found`);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se está autenticado e tenta acessar login, redireciona para dashboard
  if (isAuthenticated && (pathname === "/login")) {
    console.log("User authenticated, redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
