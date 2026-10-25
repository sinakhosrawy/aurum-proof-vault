import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Phone, MapPin, ShieldCheck, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, toEnDigits, toFaDigits, faDate } from "@/lib/site";
import { Candles } from "@/components/Candles";
import { PriceBoard, PriceTicker } from "@/components/PriceBoard";
import { SocialIcon, SOCIALS, socialHref } from "@/components/SocialIcon";
import goldBar from "@/assets/gold-bar.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "استعلام کد طلا | بهترین طلاساز سقز" },
      { name: "description", content: "کد حک‌شده روی طلای خود را وارد کنید و نتیجه عیارسنجی رسمی کارگاه را ببینید." },
      { property: "og:title", content: "استعلام کد طلا | بهترین طلاساز سقز" },
      { property: "og:description", content: "استعلام آنلاین کد و عیار طلا در سقز، کردستان." },
    ],
  }),
  component: Index,
});

type Item = { code: string; title: string; result: string; weight: string | null; notes: string | null; created_at: string };


function Index() {
  const { data: s } = useQuery(settingsQuery);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    const c = toEnDigits(code).trim();
    if (!c || c.length > 40) return;
    setLoading(true);
    setNotFound(false);
    setItem(null);
    const { data } = await supabase.rpc("lookup_gold", { _code: c });
    setLoading(false);
    const row = (data as Item[] | null)?.[0];
    if (row) setItem(row);
    else setNotFound(true);
  }

  const socials = SOCIALS.filter((x) => s?.socials?.[x.key]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Candles count={40} seed={3} className="pointer-events-none absolute inset-x-0 top-0 h-[520px] w-full opacity-25" />

      {/* ticker */}
      <div className="relative z-10 overflow-hidden border-b border-border bg-background/60 py-2 text-xs backdrop-blur">
        <PriceTicker />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <header className="rise flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl border border-gold/40 bg-gold/10 text-xl font-black text-gold">
              {(s?.name ?? "ط").trim().charAt(0)}
            </div>
            <div className="leading-tight">
              <div className="font-bold">{s?.name ?? "طلاسازی سقز"}</div>
              <div className="text-[11px] text-muted-foreground">استعلام عیار · سقز، کردستان</div>
            </div>
          </div>
          <Link to="/admin" className="glass rounded-full px-4 py-2 text-xs font-medium text-steel">
            پنل مدیریت
          </Link>
        </header>

        <div className="grid items-start gap-8 pt-6 md:grid-cols-2 md:pt-12">
          <section className="rise [animation-delay:120ms]">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <span className="live-dot size-1.5 rounded-full bg-gold" />
              {s?.tagline ?? "بهترین طلاساز شهرستان سقز"}
            </div>
            <h1 className="mt-5 text-balance text-4xl font-black leading-[1.15] md:text-6xl">
              کد طلای خود را <span className="gold-text">استعلام بگیرید</span>
            </h1>
            <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
              کد حک‌شده روی طلا را وارد کنید تا نتیجه عیارسنجی کارگاه با مهر رسمی به شما نمایش داده شود.
            </p>

            <form onSubmit={lookup} className="glass relative mt-7 overflow-hidden rounded-3xl p-4">
              <div className="sheen-run pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-transparent via-foreground/10 to-transparent" />
              <label htmlFor="code" className="text-xs font-medium tracking-wider text-muted-foreground">
                کد استعلام
              </label>
              <input
                id="code"
                inputMode="numeric"
                dir="ltr"
                maxLength={40}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="۱۰۰۴۲"
                className="mt-2 w-full rounded-2xl border border-input bg-background/70 px-4 py-3 text-center font-mono text-3xl font-bold tracking-[0.25em] outline-none placeholder:text-muted-foreground/40 focus:border-gold"
              />
              <button
                disabled={loading}
                className="bg-gold-gradient mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-base font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
                مشاهده نتیجه عیارسنجی
              </button>
            </form>
          </section>

          <section className="rise [animation-delay:240ms]">
            {item ? (
              <ResultCard item={item} shop={s?.name} />
            ) : notFound ? (
              <div className="glass rounded-3xl p-8 text-center">
                <div className="text-5xl">؟</div>
                <h3 className="mt-3 text-lg font-bold">کدی با این شماره ثبت نشده</h3>
                <p className="mt-2 text-sm text-muted-foreground">کد را دوباره بررسی کنید یا با کارگاه تماس بگیرید.</p>
              </div>
            ) : (
              <div className="glass relative overflow-hidden rounded-3xl">
                <img src={goldBar} alt="شمش طلا با مهر عیارسنجی" width={1280} height={800} className="aspect-[16/10] w-full object-cover" />
                <div className="relative h-36 border-t border-border p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-up">
                      <TrendingUp className="size-4" /> بازار طلا
                    </span>
                    <span className="font-mono text-muted-foreground">XAU · LIVE</span>
                  </div>
                  <Candles count={30} seed={11} className="absolute inset-x-4 bottom-3 h-24 w-[calc(100%-2rem)]" />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* live prices */}
        <PriceBoard />

        {/* steps */}
        <section className="mt-16 grid gap-3 sm:grid-cols-3">
          {[
            ["۱", "ساخت و عیارسنجی", "هر قطعه در کارگاه ذوب و عیارسنجی می‌شود."],
            ["۲", "ثبت کد اختصاصی", "کد و نتیجه در سامانه ثبت و روی طلا حک می‌شود."],
            ["۳", "استعلام آنلاین", "مشتری با وارد کردن کد، نتیجه را می‌بیند."],
          ].map(([n, t, d]) => (
            <div key={n} className="glass rounded-2xl p-5">
              <div className="gold-text font-mono text-3xl font-bold">{n}</div>
              <h3 className="mt-2 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>

        {/* contact */}
        <section className="glass mt-6 rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl font-black">درباره {s?.name ?? "کارگاه"}</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{s?.about}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[s?.phone, s?.phone2].filter(Boolean).map((p) => (
              <a key={p} href={`tel:${toEnDigits(p!)}`} className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-4 transition-colors hover:border-gold/50">
                <Phone className="size-5 text-gold" />
                <span dir="ltr" className="font-mono">{toFaDigits(p!)}</span>
              </a>
            ))}
            {s?.address && (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-4">
                <MapPin className="size-5 shrink-0 text-gold" />
                <span>{s.address}</span>
              </div>
            )}
          </div>
          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {socials.map((x) => (
                <a
                  key={x.key}
                  href={socialHref(x.key, s!.socials[x.key] ?? "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={x.label}
                  className="group flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                >
                  <SocialIcon name={x.key} />
                  {x.label}
                </a>
              ))}
            </div>
          )}
        </section>

        <footer className="flex items-center justify-between py-8 text-xs text-muted-foreground">
          <span>© {s?.name ?? "طلاسازی سقز"} — سقز، کردستان</span>
          <span className="font-mono">ASSAY · SAQQEZ</span>
        </footer>
      </div>
    </div>
  );
}

function ResultCard({ item, shop }: { item: Item; shop?: string | undefined }) {
  return (
    <div className="shadow-gold relative overflow-hidden rounded-3xl border border-gold/40 bg-card p-6">
      <Candles count={24} seed={item.code.length + 5} className="pointer-events-none absolute inset-0 h-full w-full opacity-10" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-up">
              <ShieldCheck className="size-4" /> تأیید شده توسط کارگاه
            </div>
            <div className="mt-1 font-bold">
              {item.title || "طلا"} · کد <span className="font-mono">{toFaDigits(item.code)}</span>
            </div>
          </div>
          <div className="stamp grid size-16 shrink-0 place-items-center rounded-full border-2 border-gold/70 bg-gold/10 text-center font-mono leading-none text-gold">
            <div>
              <div className="text-[7px] tracking-widest">ASSAY</div>
              <div className="text-sm font-bold">{toFaDigits(item.result)}</div>
              <div className="text-[6px] tracking-widest">SAQQEZ</div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-xs text-muted-foreground">جواب عیارسنجی</div>
        <div className="gold-text font-mono text-7xl font-bold leading-tight md:text-8xl">{toFaDigits(item.result)}</div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">تاریخ ثبت</div>
            <div className="mt-0.5 font-medium">{faDate(item.created_at)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">وزن</div>
            <div className="mt-0.5 font-medium">{item.weight ? toFaDigits(item.weight) : "—"}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground">کارگاه</div>
            <div className="mt-0.5 font-medium">{shop ?? "طلاسازی سقز"}</div>
          </div>
          {item.notes && <p className="col-span-2 text-muted-foreground">{item.notes}</p>}
        </div>
      </div>
    </div>
  );
}
