import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askGoldQuestion } from "@/lib/gold-question.functions";
import { goldQuestionSchema } from "@/lib/gold-question";
import { toFaDigits } from "@/lib/site";

type Exchange = { question: string; answer: string };

export function GoldQuestions({ code }: { code: string }) {
  const ask = useServerFn(askGoldQuestion);
  const [question, setQuestion] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = goldQuestionSchema.safeParse({ code, question });
    if (loading || !parsed.success) return;
    setLoading(true);
    setError("");
    try {
      const result = await ask({ data: parsed.data });
      if (result.error) setError(result.error);
      else if (result.answer) {
        setExchanges(previous => [...previous, { question: parsed.data.question, answer: result.answer }]);
        setQuestion("");
      }
    } catch {
      setError("ارتباط برقرار نشد؛ سؤال شما حفظ شده است.");
    } finally { setLoading(false); }
  }

  return (
    <section aria-label="پرسش دربارهٔ قطعه" className="mt-6 border-t border-gold/30 pt-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 shrink-0 text-gold" />
        <h2 className="font-bold">پرسش دربارهٔ این قطعه</h2>
        <span className="mr-auto text-xs text-muted-foreground">کد {toFaDigits(code)}</span>
      </div>
      <div aria-live="polite" aria-busy={loading} className="mt-4 max-h-96 space-y-4 overflow-y-auto">
        {exchanges.map((exchange, index) => (
          <div key={index} className="space-y-2 border-b border-border pb-4 text-sm leading-7">
            <p className="whitespace-pre-wrap break-words font-medium">{exchange.question}</p>
            <p className="whitespace-pre-wrap break-words text-muted-foreground">{exchange.answer}</p>
          </div>
        ))}
        {loading && <p role="status" className="flex items-center gap-2 text-sm text-gold"><Loader2 className="size-4 animate-spin" />در حال بررسی اطلاعات قطعه…</p>}
      </div>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <label htmlFor={`question-${code}`} className="text-xs text-muted-foreground">سؤال شما</label>
        <Textarea id={`question-${code}`} value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} disabled={loading} placeholder="نتیجهٔ ثبت‌شدهٔ این قطعه چیست؟" className="min-h-24 resize-y bg-background/40 leading-6" />
        {error && <p role="alert" className="text-sm leading-6 text-destructive">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{toFaDigits(question.length)} / ۱۰۰۰</span>
          <Button type="submit" disabled={loading || !question.trim()}><Send />ارسال سؤال</Button>
        </div>
      </form>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">پاسخ هوشمند جایگزین تأیید کارگاه نیست؛ نتیجهٔ ثبت‌شده ملاک است.</p>
    </section>
  );
}