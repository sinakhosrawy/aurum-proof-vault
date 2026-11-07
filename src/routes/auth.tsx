import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ADMIN_EMAIL, isAllowedAdminEmail } from "@/lib/admin-access";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود به پنل مدیریت | طلاسازی سقز" },
      { name: "description", content: "ورود مدیر کارگاه طلاسازی برای ثبت کدها و نتایج." },
      { property: "og:title", content: "ورود به پنل مدیریت" },
      { property: "og:description", content: "ورود مدیر کارگاه طلاسازی سقز." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({ email: z.string().trim().email("ایمیل نامعتبر است").max(255), password: z.string().min(6, "رمز حداقل ۶ کاراکتر").max(100) });

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "forgot">("in");
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAllowedAdminEmail(email)) { toast.error("این ایمیل اجازهٔ ورود ندارد."); return; }
    if (mode === "forgot") {
      setBusy(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) { toast.error("ارسال لینک انجام نشد؛ کمی بعد دوباره تلاش کنید."); return; }
        setSent(true);
        toast.success("لینک بازیابی رمز ارسال شد؛ پوشهٔ هرزنامه را هم بررسی کنید.");
      } catch { toast.error("ارتباط برقرار نشد؛ دوباره تلاش کنید."); }
      finally { setBusy(false); }
      return;
    }
    const p = schema.safeParse({ email: ADMIN_EMAIL, password });
    if (!p.success) { toast.error(p.error.issues[0]?.message ?? "خطا"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(p.data);
      if (error) { toast.error("ایمیل یا رمز اشتباه است"); return; }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !isAllowedAdminEmail(userData.user.email)) {
        await supabase.auth.signOut(); toast.error("دسترسی مجاز نیست."); return;
      }
      const { data: allowed, error: roleError } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
      if (roleError || !allowed) { await supabase.auth.signOut(); toast.error("دسترسی مدیر ندارید."); return; }
      nav({ to: "/admin" });
    } catch { toast.error("ارتباط برقرار نشد؛ دوباره تلاش کنید."); }
    finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="glass rise w-full max-w-sm rounded-lg p-6">
        <Link to="/" className="text-xs text-muted-foreground">← بازگشت به سایت</Link>
        <h1 className="mt-3 text-2xl font-black">
          {mode === "in" ? "ورود به " : "بازیابی رمز "}
          <span className="gold-text">پنل مدیریت</span>
        </h1>
        <label htmlFor="admin-email" className="mt-5 block text-sm">ایمیل</label>
        <input id="admin-email" dir="ltr" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-input bg-background/70 px-4 py-3 outline-none focus:border-gold" />
        {mode === "in" && <><label htmlFor="admin-password" className="mt-3 block text-sm">رمز عبور</label><input id="admin-password" dir="ltr" type="password" autoComplete="current-password" required placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-input bg-background/70 px-4 py-3 outline-none focus:border-gold" /></>}
        {sent && mode === "forgot" && <p role="status" className="mt-3 text-sm text-gold">لینک بازیابی ارسال شد. ایمیل و پوشهٔ هرزنامه را بررسی کنید.</p>}
        <Button type="submit" disabled={busy} className="bg-gold-gradient mt-4 h-12 w-full font-bold">
          {busy ? "در حال انجام…" : mode === "in" ? "ورود" : "ارسال لینک بازیابی"}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => { setMode(mode === "in" ? "forgot" : "in"); setSent(false); }} className="mt-3 w-full text-steel">
          {mode === "in" ? "فراموشی رمز عبور" : "بازگشت به ورود"}
        </Button>
      </form>
    </div>
  );
}
