import { describe, expect, it } from "vitest";
import { isAllowedAdminEmail } from "@/lib/admin-access";

describe("single administrator email", () => {
  it("allows the email specified by the owner", () => {
    expect(isAllowedAdminEmail("sinakhosravi2025@gmail.com")).toBe(true);
  });
  it("rejects other emails and missing identities", () => {
    expect(isAllowedAdminEmail("talasazsaqqz@gmail.com")).toBe(false);
    expect(isAllowedAdminEmail(undefined)).toBe(false);
  });
  it("normalizes email case and surrounding spaces", () => {
    expect(isAllowedAdminEmail(" SINAKHOSRAVI2025@gmail.com ")).toBe(true);
  });
});