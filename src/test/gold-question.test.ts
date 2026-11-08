import { describe, expect, it } from "vitest";
import { goldQuestionSchema, goldQuestionInput } from "@/lib/gold-question";

describe("piece-specific customer questions", () => {
  it("accepts only the code and question, not a customer-supplied result", () => {
    expect(goldQuestionSchema.safeParse({ code: "10042", question: "نتیجه چیست؟", result: "999" }).success).toBe(false);
    expect(goldQuestionSchema.parse({ code: "۱۰۰۴۲", question: "نتیجه چیست؟" }).code).toBe("10042");
  });
  it("grounds the answer in the exact public piece fields", () => {
    const input = JSON.parse(goldQuestionInput({ code: "10042", title: "طلای آب‌شده", result: "775", weight: null, notes: null, created_at: "2026-11-07T00:00:00Z", private_owner: "not public" } as Parameters<typeof goldQuestionInput>[0], "نتیجه چیست؟"));
    expect(input.piece.code).toBe("10042");
    expect(input.piece.result).toBe("775");
    expect(input.piece.weight).toBeNull();
    expect(input.piece.private_owner).toBeUndefined();
  });
});