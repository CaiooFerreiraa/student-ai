import { escapeHtml, sanitizeString, sanitizeUnknown } from "@/infrastructure/security/sanitize";

describe("sanitize utilities", () => {
  it("normalizes strings and removes control characters", () => {
    expect(sanitizeString("  hello\u0000   world  ")).toBe("hello world");
  });

  it("sanitizes nested payloads recursively", () => {
    const result = sanitizeUnknown({
      name: "  Maria  ",
      tags: ["  a  ", "b\u0000"],
    });

    expect(result).toEqual({
      name: "Maria",
      tags: ["a", "b"],
    });
  });

  it("escapes html-sensitive characters", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });
});
