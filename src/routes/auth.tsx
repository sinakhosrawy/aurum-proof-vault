import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود به پنل مدیریت | طلاسازی سقز" },
      { name: "description", content: "ورود مدیر کارگاه طلاسازی برای ثبت کدها و نتایج." },
      { property: "og:title", content: "ورود به پنل مدیریت" },
      { property: "og:description", content: "ورود مدیر کارگاه طلاسازی سقز." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({ email: z.string().trim().email("ایمیل نامعتبر است").max(255), password: z.string().min(6, "رمز حداقل ۶ کاراکتر").max(100) });

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse({ email, password });
    if (!p.success) { toast.error(p.error.issues[0]?.message ?? "خطا"); return; }
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(p.data);
      setBusy(false);
      if (error) { toast.error("ایمیل یا رمز اشتباه است"); return; }
      nav({ to: "/admin" });
    } else {
      const { data, error } = await supabase.auth.signUp({ ...p.data, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      if (data.session) nav({ to: "/admin" });
      else toast.success("لینک تأیید به ایمیل شما ارسال شد.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="glass rise w-full max-w-sm rounded-3xl p-6">
        <Link to="/" className="text-xs text-muted-foreground">← بازگشت به سایت</Link>
        <h1 className="mt-3 text-2xl font-black">
          {mode === "in" ? "ورود به " : "ساخت حساب "}
          <span className="gold-text">پنل مدیریت</span>
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">اولین حسابی که ساخته شود، مدیر سایت خواهد بود.</p>
        <input dir="ltr" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-5 w-full rounded-xl border border-input bg-background/70 px-4 py-3 outline-none focus:border-gold" />
        <input dir="ltr" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-3 w-full rounded-xl border border-input bg-background/70 px-4 py-3 outline-none focus:border-gold" />
        <button disabled={busy} className="bg-gold-gradient mt-4 w-full rounded-xl py-3 font-bold text-primary-foreground disabled:opacity-60">
          {mode === "in" ? "ورود" : "ثبت‌نام"}
        </button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-3 w-full text-center text-sm text-steel">
          {mode === "in" ? "حساب ندارید؟ ثبت‌نام" : "حساب دارید؟ ورود"}
        </button>
      </form>
    </div>
  );
}
