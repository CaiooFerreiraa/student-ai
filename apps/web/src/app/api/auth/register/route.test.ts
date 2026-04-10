import { NextRequest } from "next/server";

describe("POST /api/auth/register", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SECURITY_CORS_ALLOWED_ORIGINS: "http://localhost:3000,https://student-ai.vercel.app",
      SECURITY_CORS_ALLOWED_ORIGIN_PATTERNS: "https://student-ai-*.vercel.app",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("creates an account with valid payload", async () => {
    const registerUser = jest.fn().mockResolvedValue({
      id: "user-1",
      email: "ana@example.com",
      name: "Ana",
    });

    jest.doMock("@/application/use-cases/register-user", () => ({
      registerUser,
    }));

    const { POST } = await import("@/app/api/auth/register/route");
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Ana",
        email: "ana@example.com",
        password: "12345678",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.id).toBe("user-1");
    expect(registerUser).toHaveBeenCalledTimes(1);
  });

  it("returns conflict when the user already exists", async () => {
    jest.doMock("@/application/use-cases/register-user", () => ({
      registerUser: jest.fn().mockRejectedValue(new Error("Já existe uma conta com este e-mail.")),
    }));

    const { POST } = await import("@/app/api/auth/register/route");
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Ana",
        email: "ana@example.com",
        password: "12345678",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toBe("Já existe uma conta com este e-mail.");
  });
});
