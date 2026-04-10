import { signInSchema, signUpSchema } from "@/application/validators/auth-schemas";

describe("auth schemas", () => {
  it("sanitizes and validates sign in payloads", () => {
    const result = signInSchema.parse({
      email: "  student@example.com  ",
      password: "12345678",
    });

    expect(result.email).toBe("student@example.com");
    expect(result.password).toBe("12345678");
  });

  it("rejects unsafe display names", () => {
    const result = signUpSchema.safeParse({
      name: "Robert'); DROP TABLE users;--",
      email: "student@example.com",
      password: "12345678",
    });

    expect(result.success).toBe(false);
  });

  it("accepts sanitized sign up payloads", () => {
    const result = signUpSchema.parse({
      name: "  Ana Maria  ",
      email: " ana@example.com ",
      password: "12345678",
    });

    expect(result.name).toBe("Ana Maria");
    expect(result.email).toBe("ana@example.com");
  });
});
