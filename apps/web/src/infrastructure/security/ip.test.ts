import { getClientIpAddress } from "@/infrastructure/security/ip";

describe("ip utilities", () => {
  it("prefers Vercel forwarded headers", () => {
    const request = new Request("http://localhost", {
      headers: {
        "x-vercel-forwarded-for": "198.51.100.1",
        "x-forwarded-for": "203.0.113.10",
      },
    });

    expect(getClientIpAddress(request)).toBe("198.51.100.1");
  });

  it("falls back to x-forwarded-for and trims the first value", () => {
    const request = new Request("http://localhost", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 203.0.113.11",
      },
    });

    expect(getClientIpAddress(request)).toBe("203.0.113.10");
  });

  it("returns localhost when no forwarding header exists", () => {
    const request = new Request("http://localhost");

    expect(getClientIpAddress(request)).toBe("127.0.0.1");
  });
});
