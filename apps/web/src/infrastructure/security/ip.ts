type RequestLike = {
  headers: Headers;
};

export function getClientIpAddress(request: RequestLike): string {
  const forwardedFor: string | null = request.headers.get("x-forwarded-for");
  const realIp: string | null = request.headers.get("x-real-ip");
  const vercelForwardedFor: string | null = request.headers.get("x-vercel-forwarded-for");

  const candidate: string | null =
    vercelForwardedFor ?? forwardedFor?.split(",")[0]?.trim() ?? realIp ?? null;

  return candidate && candidate.length > 0 ? candidate : "127.0.0.1";
}
