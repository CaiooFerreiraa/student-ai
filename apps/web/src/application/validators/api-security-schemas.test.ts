import {
  healthQuerySchema,
  registerApiBodySchema,
} from "@/application/validators/api-security-schemas";

describe("api security schemas", () => {
  it("parses verbose query flag safely", () => {
    const result = healthQuerySchema.parse({
      verbose: "true",
    });

    expect(result.verbose).toBe(true);
  });

  it("defaults verbose to false when omitted", () => {
    const result = healthQuerySchema.parse({});

    expect(result.verbose).toBe(false);
  });

  it("reuses secure registration schema for api requests", () => {
    const result = registerApiBodySchema.parse({
      name: "Joao Silva",
      email: "joao@example.com",
      password: "12345678",
    });

    expect(result.name).toBe("Joao Silva");
    expect(result.email).toBe("joao@example.com");
  });
});
