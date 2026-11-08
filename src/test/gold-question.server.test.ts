import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), generate: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ rpc: mocks.rpc }) }));
vi.mock("@lovable.dev/ai-gateway", () => ({ generateResponse: mocks.generate, GatewayError: class extends Error {} }));
import { answerGoldQuestion } from "@/lib/gold-question.server";

describe("authoritative record lookup before AI", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://test.invalid");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    vi.clearAllMocks();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("does not run AI for a missing piece", async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null });
    const result = await answerGoldQuestion({ code: "missing", question: "نتیجه چیست؟" });
    expect(result.error).toBeDefined();
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("uses the exact code and result from the current lookup", async () => {
    mocks.rpc.mockResolvedValue({ data: [{ code: "10042", result: "775", title: "طلا", weight: null, notes: null, created_at: "2026-11-07T00:00:00Z" }], error: null });
    mocks.generate.mockResolvedValue({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: "نتیجهٔ ثبت‌شده ۷۷۵ است." }] }] });
    const result = await answerGoldQuestion({ code: "10042", question: "نتیجه چیست؟" });
    expect(mocks.rpc).toHaveBeenCalledWith("lookup_gold", { _code: "10042" });
    const request = mocks.generate.mock.calls[0]?.[0];
    expect(JSON.parse(request.input[0].content).piece.result).toBe("775");
    expect(result.answer).toBe("نتیجهٔ ثبت‌شده ۷۷۵ است.");
  });
});