import {
  analyticsFiltersSchema,
  paginatedHistoryQuerySchema,
} from "@/application/validators/analytics-schemas";

describe("analytics schemas", () => {
  it("parses analytics filters with optional blanks", () => {
    const parsed = analyticsFiltersSchema.parse({
      period: "90d",
      subjectId: "",
      difficulty: "",
      questionType: "essay",
      from: "",
      to: "2026-04-09",
    });

    expect(parsed.period).toBe("90d");
    expect(parsed.subjectId).toBeUndefined();
    expect(parsed.questionType).toBe("essay");
    expect(parsed.to).toBe("2026-04-09");
  });

  it("parses paginated history query defaults", () => {
    const parsed = paginatedHistoryQuerySchema.parse({
      page: "2",
      pageSize: "10",
      period: "30d",
    });

    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(10);
    expect(parsed.period).toBe("30d");
  });
});
