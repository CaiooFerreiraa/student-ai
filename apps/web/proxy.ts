import { NextResponse } from "next/server";
import { auth } from "./src/auth";
import { getClientIpAddress } from "./src/infrastructure/security/ip";
import { isOriginAllowed } from "./src/infrastructure/security/origin";
import { applyRateLimit } from "./src/infrastructure/security/rate-limit";

function withCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("Vary", "Origin");

  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  return response;
}

function getRetryAfterSeconds(resetAt: number): number {
  if (resetAt <= 0) {
    return 1;
  }

  const remainingMilliseconds: number = resetAt - Date.now();
  return Math.max(Math.ceil(remainingMilliseconds / 1000), 1);
}

export default auth(async (request) => {
  const isAuthenticated = Boolean(request.auth);
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/context") ||
    (pathname.startsWith("/quizzes") && pathname !== "/quizzes/demo");
  const isGuestRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiRoute = pathname.startsWith("/api");

  if (isApiRoute) {
    const originDecision = isOriginAllowed(request.headers.get("origin"));

    if (!originDecision.allowed) {
      return withCorsHeaders(
        NextResponse.json({ error: "Origin not allowed." }, { status: 403 }),
        originDecision.origin,
      );
    }

    if (request.method === "OPTIONS") {
      return withCorsHeaders(new NextResponse(null, { status: 204 }), originDecision.origin);
    }

    const ipAddress: string = getClientIpAddress(request);
    const scope = pathname.startsWith("/api/auth") ? "auth" : "api";
    const decision = await applyRateLimit(`${scope}:${ipAddress}`, scope);

    if (!decision.success) {
      const response = withCorsHeaders(
        NextResponse.json({ error: "Too many requests." }, { status: 429 }),
        originDecision.origin,
      );

      response.headers.set("Retry-After", String(getRetryAfterSeconds(decision.reset)));

      if (decision.limit > 0) {
        response.headers.set("X-RateLimit-Limit", String(decision.limit));
        response.headers.set("X-RateLimit-Remaining", String(decision.remaining));
        response.headers.set("X-RateLimit-Reset", String(decision.reset));
      }

      return response;
    }

    const response = withCorsHeaders(NextResponse.next(), originDecision.origin);

    if (decision.limit > 0) {
      response.headers.set("X-RateLimit-Limit", String(decision.limit));
      response.headers.set("X-RateLimit-Remaining", String(decision.remaining));
      response.headers.set("X-RateLimit-Reset", String(decision.reset));
    }

    return response;
  }

  if (isGuestRoute && isAuthenticated) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedRoute && !isAuthenticated) {
    return Response.redirect(new URL("/login", request.url));
  }

  return undefined;
});

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/history/:path*",
    "/context/:path*",
    "/quizzes/:path*",
    "/login",
    "/register",
  ],
};
