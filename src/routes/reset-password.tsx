import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isAllowedAdminEmail } from "@/lib/admin-access";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "تعیین رمز جدید | طلاسازی سقز" },
    { name: "description", content: "بازیابی امن رمز عبور حساب مدیر طلاسازی سقز." },
    { property: "og:title", content: "تعیین رمز جدید | طلاسازی سقز" },
    { property: "og:description", content: "بازیابی رمز عبور مدیریت کارگاه طلاسازی سقز." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const [state, setState] = useState<"checking" | "ready" | "invalid" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    let recovery = hash.get("type") === "recovery";
    const hasCode = new URLSearchParams(window.location.search).has("code");
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") recovery = true;
    });
    async function check() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user || !isAllowedAdminEmail(data.user.email) || (!recovery && !hasCode)) {
        setState("invalid"); return;
      }
      const { data: allowed } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (active) {
        setState(allowed ? "ready" : "invalid");
        if (allowed) window.history.replaceState(null, "", window.location.pathname);
      }
    }
    check().catch(() => { if (active) setState("invalid"); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== "ready" || busy) return;
    if (password.length < 8 || password.length > 100) { toast.error("رمز باید بین ۸ تا ۱۰۰ کاراکتر باشد."); return; }
    if (password !== confirm) { toast.error("تکرار رمز یکسان نیست."); return; }
    setBusy(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!isAllowedAdminEmail(user.user?.email)) { setState("invalid"); return; }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { toast.error("رمز تغییر نکرد؛ رمز قوی‌تری انتخاب کنید یا لینک جدید بگیرید."); return; }
      await supabase.auth.signOut();
      setPassword(""); setConfirm(""); setState("done");
    } catch { toast.error("ارتباط برقرار نشد؛ دوباره تلاش کنید."); }
    finally { setBusy(false); }
  }

  return <div className="flex min-h-screen items-center justify-center px-4">
    <section className="glass w-full max-w-sm rounded-lg p-6">
      <h1 className="gold-text text-2xl font-black">تعیین رمز جدید</h1>
      {state === "checking" && <p className="mt-4 text-sm text-muted-foreground">در حال بررسی لینک…</p>}
      {state === "invalid" && <p role="alert" className="mt-4 text-sm text-muted-foreground">لینک بازیابی نامعتبر یا منقضی شده است؛ لینک جدید دریافت کنید.</p>}
      {state === "done" && <p role="status" className="mt-4 text-sm text-gold">رمز تغییر کرد؛ با رمز جدید وارد شوید.</p>}
      {state === "ready" && <form onSubmit={submit} className="mt-5 space-y-3">
        <label htmlFor="new-password" className="block text-sm">رمز جدید</label>
        <input id="new-password" dir="ltr" type="password" autoComplete="new-password" minLength={8} maxLength={100} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-input bg-background/70 px-4 py-3" />
        <label htmlFor="confirm-password" className="block text-sm">تکرار رمز جدید</label>
        <input id="confirm-password" dir="ltr" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-lg border border-input bg-background/70 px-4 py-3" />
        <Button type="submit" disabled={busy} className="bg-gold-gradient h-12 w-full">{busy ? "در حال ذخیره…" : "ذخیرهٔ رمز جدید"}</Button>
      </form>}
      <Button asChild variant="ghost" className="mt-4 w-full"><Link to="/auth">بازگشت به ورود</Link></Button>
    </section>
  </div>;
}