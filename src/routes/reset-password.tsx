import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "ساخت رمز جدید | طلاسازی سقز" },
      { name: "description", content: "ساخت رمز عبور جدید برای ورود به پنل مدیریت." },
      { property: "og:title", content: "ساخت رمز جدید" },
      { property: "og:description", content: "ساخت رمز عبور جدید پنل مدیریت طلاسازی سقز." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) { toast.error("رمز حداقل ۶ کاراکتر باشد"); return; }
    if (pw !== pw2) { toast.error("دو رمز یکسان نیستند"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error("لینک منقضی شده؛ دوباره «فراموشی رمز» را بزنید"); return; }
    toast.success("رمز جدید ذخیره شد");
    nav({ to: "/admin" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="glass rise w-full max-w-sm rounded-3xl p-6">
        <Link to="/auth" className="text-xs text-muted-foreground">← بازگشت به ورود</Link>
        <h1 className="mt-3 text-2xl font-black">ساخت <span className="gold-text">رمز جدید</span></h1>
        <input dir="ltr" type="password" placeholder="رمز جدید" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-5 w-full rounded-xl border border-input bg-background/70 px-4 py-3 outline-none focus:border-gold" />
        <input dir="ltr" type="password" placeholder="تکرار رمز" value={pw2} onChange={(e) => setPw2(e.target.value)} className="mt-3 w-full rounded-xl border border-input bg-background/70 px-4 py-3 outline-none focus:border-gold" />
        <button disabled={busy} className="bg-gold-gradient mt-4 w-full rounded-xl py-3 font-bold text-primary-foreground disabled:opacity-60">
          ذخیره رمز
        </button>
      </form>
    </div>
  );
}
