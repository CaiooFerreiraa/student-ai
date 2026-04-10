describe("GET /api/openapi", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("returns 404 when API docs are disabled", async () => {
    jest.doMock("@/infrastructure/config/feature-flags", () => ({
      isFeatureEnabled: jest.fn(() => false),
    }));

    const { GET } = await import("@/app/api/openapi/route");
    const response = await GET();

    expect(response.status).toBe(404);
  });

  it("returns the OpenAPI document when enabled", async () => {
    jest.doMock("@/infrastructure/config/feature-flags", () => ({
      isFeatureEnabled: jest.fn(() => true),
    }));

    const { GET } = await import("@/app/api/openapi/route");
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.openapi).toBe("3.1.0");
    expect(payload.paths["/api/quiz/generate"]).toBeDefined();
  });
});
