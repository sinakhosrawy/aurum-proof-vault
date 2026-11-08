import { createClient } from "@supabase/supabase-js";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import type { Database } from "@/integrations/supabase/types";
import { GOLD_QUESTION_INSTRUCTIONS, goldQuestionInput, goldRecordSchema, type GoldAnswer } from "./gold-question";

export async function answerGoldQuestion(data: { code: string; question: string }): Promise<GoldAnswer> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return { error: "اطلاعات قطعه در دسترس نیست؛ کمی بعد دوباره تلاش کنید." };
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  try {
    const { data: rows, error } = await client.rpc("lookup_gold", { _code: data.code });
    if (error) return { error: "دریافت اطلاعات قطعه ممکن نشد؛ دوباره استعلام بگیرید." };
    const row = rows?.[0];
    if (!row) return { error: "این کد دیگر در سامانه موجود نیست؛ دوباره استعلام بگیرید." };
    const record = goldRecordSchema.parse(row);
    const response = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions: GOLD_QUESTION_INSTRUCTIONS,
      input: [{ role: "user", content: goldQuestionInput(record, data.question) }],
      reasoning: { effort: "low" },
      max_output_tokens: 1800,
    });
    const messages = response.output.filter(output => output.type === "message");
    const refused = messages.some(message => message.content.some(content => content.type === "refusal"));
    if (refused) return { error: "پاسخ به این پرسش ممکن نیست؛ دربارهٔ اطلاعات ثبت‌شدهٔ قطعه سؤال کنید." };
    if (response.status !== "completed") return { error: "پاسخ کامل دریافت نشد؛ اطلاعات رسمی قطعه را ملاک قرار دهید." };
    const answer = messages.flatMap(message => message.content.flatMap(content => content.type === "output_text" ? [content.text] : [])).join("\n").trim();
    return answer ? { answer } : { error: "پاسخی دریافت نشد؛ اطلاعات رسمی قطعه را ملاک قرار دهید." };
  } catch (error) {
    if (error instanceof GatewayError) {
      console.error("Gold question gateway failure", { code: error.code, outcome: error.outcome, ids: error.ids, remote: error.remote });
      if (error.code === "payment_required") return { error: "اعتبار پاسخ‌گویی هوشمند تمام شده است؛ با کارگاه تماس بگیرید." };
      if (error.code === "rate_limited") return { error: "سرویس پاسخ‌گویی شلوغ است؛ کمی بعد تلاش کنید." };
      return { error: "پاسخ‌گویی هوشمند فعلاً در دسترس نیست؛ سؤال شما حفظ شده است." };
    }
    console.error("Gold question application failure");
    return { error: "دریافت پاسخ ممکن نشد؛ لطفاً کمی بعد تلاش کنید." };
  }
}