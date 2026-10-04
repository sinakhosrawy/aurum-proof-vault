import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2, Pencil, LogOut, Search, Save, X, Coins, Settings, Share2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, toEnDigits, toFaDigits, faDate, type Settings as SiteSettings } from "@/lib/site";
import { SOCIALS, SocialIcon } from "@/components/SocialIcon";
import { Candles } from "@/components/Candles";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "پنل مدیریت | طلاسازی سقز" },
      { name: "description", content: "ثبت کد طلا، نتیجه عیارسنجی و اطلاعات تماس." },
      { property: "og:title", content: "پنل مدیریت طلاسازی" },
      { property: "og:description", content: "مدیریت کدها و اطلاعات سایت." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Item = { id: string; code: string; title: string; result: string; weight: string | null; notes: string | null; created_at: string };

const itemSchema = z.object({
  code: z.string().trim().min(1, "کد را وارد کنید").max(40),
  title: z.string().trim().max(100),
  result: z.string().trim().min(1, "جواب را وارد کنید").max(40),
  weight: z.string().trim().max(40),
  notes: z.string().trim().max(500),
});

const field = "w-full rounded-xl border border-input bg-background/70 px-3 py-2.5 outline-none focus:border-gold";

function Admin() {
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"codes" | "settings" | "socials">("codes");

  const isAdmin = useQuery({
    queryKey: ["is_admin", user.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      return !!data;
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  if (isAdmin.isLoading) return <div className="p-10 text-center text-muted-foreground">در حال بارگذاری…</div>;
  if (!isAdmin.data)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-bold">شما دسترسی مدیر ندارید</h1>
        <button onClick={signOut} className="rounded-xl border border-border px-4 py-2">خروج</button>
      </div>
    );

  const tabs = [
    { k: "codes", l: "کدهای طلا", i: Coins },
    { k: "settings", l: "اطلاعات تماس", i: Settings },
    { k: "socials", l: "شبکه‌های اجتماعی", i: Share2 },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <header className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-2xl font-black">
            <span className="gold-text">پنل مدیریت</span>
          </h1>
          <p className="text-xs text-muted-foreground" dir="ltr">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm"><ExternalLink className="size-4" /> سایت</Link>
          <button onClick={signOut} className="glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm"><LogOut className="size-4" /> خروج</button>
        </div>
      </header>

      <nav className="glass mb-6 flex gap-1 overflow-x-auto rounded-2xl p-1">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.i className="size-4" /> {t.l}
          </button>
        ))}
      </nav>

      {tab === "codes" && <Codes />}
      {tab === "settings" && <SettingsForm />}
      {tab === "socials" && <SocialsForm />}
    </div>
  );
}

function Codes() {
  const items = useQuery({
    queryKey: ["gold_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gold_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Item[];
    },
  });
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const empty = { code: "", title: "", result: "", weight: "", notes: "" };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editing) setForm({ code: editing.code, title: editing.title, result: editing.result, weight: editing.weight ?? "", notes: editing.notes ?? "" });
  }, [editing]);

  const list = useMemo(() => {
    const s = toEnDigits(q).trim();
    return (items.data ?? []).filter((i) => !s || i.code.includes(s) || i.title.includes(q) || i.result.includes(s));
  }, [items.data, q]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = itemSchema.safeParse(form);
    if (!p.success) return toast.error(p.error.issues[0].message);
    const row = { ...p.data, code: toEnDigits(p.data.code), result: toEnDigits(p.data.result), weight: p.data.weight || null, notes: p.data.notes || null };
    setBusy(true);
    const { error } = editing
      ? await supabase.from("gold_items").update(row).eq("id", editing.id)
      : await supabase.from("gold_items").insert(row);
    setBusy(false);
    if (error) return toast.error(error.code === "23505" ? "این کد قبلاً ثبت شده است" : "خطا در ذخیره");
    toast.success(editing ? "ویرایش شد" : "کد ثبت شد");
    setEditing(null);
    setForm(empty);
    items.refetch();
  }

  async function remove(i: Item) {
    if (!confirm(`کد ${i.code} حذف شود؟`)) return;
    const { error } = await supabase.from("gold_items").delete().eq("id", i.id);
    if (error) return toast.error("خطا در حذف");
    toast.success("حذف شد");
    items.refetch();
  }

  const total = items.data?.length ?? 0;
  const today = (items.data ?? []).filter((i) => new Date(i.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="کل کدها" value={total} />
          <Stat label="ثبت امروز" value={today} />
        </div>
        <form onSubmit={save} className="glass space-y-3 rounded-3xl p-5">
          <h2 className="flex items-center gap-2 font-bold">
            {editing ? <Pencil className="size-4 text-gold" /> : <Plus className="size-4 text-gold" />}
            {editing ? "ویرایش کد" : "ثبت کد جدید"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <L t="کد طلا *"><input dir="ltr" className={`${field} font-mono`} placeholder="10042" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></L>
            <L t="کد جواب *"><input dir="ltr" className={`${field} font-mono`} placeholder="775" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} /></L>
          </div>
          <L t="نوع طلا"><input className={field} placeholder="طلای آب‌شده" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></L>
          <L t="وزن"><input className={field} placeholder="۱۲.۵ گرم" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></L>
          <L t="توضیحات"><textarea rows={2} className={field} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></L>
          <div className="flex gap-2">
            <button disabled={busy} className="bg-gold-gradient flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold text-primary-foreground disabled:opacity-60">
              <Save className="size-4" /> {editing ? "ذخیره تغییرات" : "ثبت"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="rounded-xl border border-border px-4"><X className="size-4" /></button>
            )}
          </div>
        </form>
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <Search className="size-4 text-muted-foreground" />
          <input className="w-full bg-transparent outline-none" placeholder="جستجوی کد، نوع یا جواب…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="max-h-[640px] divide-y divide-border overflow-y-auto">
          {items.isLoading && <div className="p-6 text-center text-muted-foreground">در حال بارگذاری…</div>}
          {!items.isLoading && list.length === 0 && <div className="p-6 text-center text-muted-foreground">موردی یافت نشد</div>}
          {list.map((i) => (
            <div key={i.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/40">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">{toFaDigits(i.code)}</span>
                  <span className="truncate text-sm text-muted-foreground">{i.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">{faDate(i.created_at)}{i.weight ? ` · ${i.weight}` : ""}</div>
              </div>
              <div className="gold-text font-mono text-2xl font-bold">{toFaDigits(i.result)}</div>
              <button onClick={() => setEditing(i)} className="rounded-lg p-2 text-steel hover:bg-accent" aria-label="ویرایش"><Pencil className="size-4" /></button>
              <button onClick={() => remove(i)} className="rounded-lg p-2 text-destructive hover:bg-accent" aria-label="حذف"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      <Candles count={14} seed={value + 2} className="pointer-events-none absolute inset-0 h-full w-full opacity-15" />
      <div className="relative text-xs text-muted-foreground">{label}</div>
      <div className="gold-text relative font-mono text-3xl font-bold">{toFaDigits(value)}</div>
    </div>
  );
}

function L({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-xs text-muted-foreground">
      <span>{t}</span>
      {children}
    </label>
  );
}

function useSettingsSave() {
  const qc = useQueryClient();
  return async (patch: Partial<SiteSettings>) => {
    const { error } = await supabase.from("site_settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return toast.error("خطا در ذخیره");
    toast.success("ذخیره شد");
    qc.invalidateQueries({ queryKey: settingsQuery.queryKey });
  };
}

function SettingsForm() {
  const { data } = useQuery(settingsQuery);
  const save = useSettingsSave();
  const [f, setF] = useState({ name: "", tagline: "", about: "", phone: "", phone2: "", address: "" });
  useEffect(() => {
    if (data) setF({ name: data.name, tagline: data.tagline, about: data.about, phone: data.phone, phone2: data.phone2, address: data.address });
  }, [data]);
  const s = z.object({ name: z.string().trim().min(1).max(80), tagline: z.string().trim().max(120), about: z.string().trim().max(1000), phone: z.string().trim().max(30), phone2: z.string().trim().max(30), address: z.string().trim().max(200) });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const p = s.safeParse(f);
        if (!p.success) return toast.error("لطفاً فیلدها را بررسی کنید");
        save(p.data);
      }}
      className="glass grid gap-4 rounded-3xl p-6 md:grid-cols-2"
    >
      <L t="نام کارگاه"><input className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></L>
      <L t="شعار"><input className={field} value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></L>
      <L t="شماره تماس ۱"><input dir="ltr" className={field} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></L>
      <L t="شماره تماس ۲"><input dir="ltr" className={field} value={f.phone2} onChange={(e) => setF({ ...f, phone2: e.target.value })} /></L>
      <div className="md:col-span-2"><L t="آدرس"><input className={field} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></L></div>
      <div className="md:col-span-2"><L t="درباره کارگاه"><textarea rows={4} className={field} value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} /></L></div>
      <button className="bg-gold-gradient flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-primary-foreground md:col-span-2"><Save className="size-4" /> ذخیره اطلاعات</button>
    </form>
  );
}

function SocialsForm() {
  const { data } = useQuery(settingsQuery);
  const save = useSettingsSave();
  const [f, setF] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data) setF(data.socials ?? {});
  }, [data]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const clean: Record<string, string> = {};
        for (const x of SOCIALS) {
          const v = (f[x.key] ?? "").trim().slice(0, 200);
          if (v) clean[x.key] = v;
        }
        save({ socials: clean });
      }}
      className="glass rounded-3xl p-6"
    >
      <p className="mb-4 text-sm text-muted-foreground">آیدی یا لینک کامل هر شبکه را وارد کنید. موارد خالی در سایت نمایش داده نمی‌شوند.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {SOCIALS.map((x) => (
          <div key={x.key} className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold"><SocialIcon name={x.key} /></div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">{x.label}</div>
              <input dir="ltr" className="w-full bg-transparent py-1 outline-none" placeholder={x.key === "whatsapp" ? "989181234567" : x.key === "website" ? "https://..." : "@username"} value={f[x.key] ?? ""} onChange={(e) => setF({ ...f, [x.key]: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <button className="bg-gold-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-primary-foreground"><Save className="size-4" /> ذخیره شبکه‌ها</button>
    </form>
  );
}
