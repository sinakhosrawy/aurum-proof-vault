import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, Phone, Smartphone, ShieldCheck, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, toEnDigits, toFaDigits, faDate } from "@/lib/site";
import { SocialIcon, SOCIALS, socialHref } from "@/components/SocialIcon";
import emblem from "@/assets/gold-emblem.png";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { code?: string } =>
    s["code"] ? { code: String(s["code"]).slice(0, 40) } : {},
  head: () => ({
    meta: [
      { title: "استعلام کد طلا | بهترین طلاساز سقز" },
      { name: "description", content: "کد حک‌شده روی طلای خود را وارد کنید و نتیجه عیارسنجی رسمی کارگاه را ببینید." },
      { property: "og:title", content: "استعلام کد طلا | بهترین طلاساز سقز" },
      { property: "og:description", content: "سامانه استعلام عیار طلا در سقز، کردستان." },
    ],
  }),
  component: Index,
});

type Item = { code: string; title: string; result: string; weight: string | null; notes: string | null; created_at: string };

function Index() {
  const { data: s } = useQuery(settingsQuery);
  const { code: urlCode } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [code, setCode] = useState(urlCode ?? "");
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function run(raw: string) {
    const c = toEnDigits(raw).trim();
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

  useEffect(() => {
    if (urlCode) {
      setCode(urlCode);
      run(urlCode);
    }
  }, [urlCode]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = toEnDigits(code).trim();
    if (!c) return;
    if (c === urlCode) run(c);
    else navigate({ search: { code: c } });
  }

  const name = s?.name ?? "طلاسازی سقز";
  const socials = SOCIALS.filter((x) => s?.socials?.[x.key]);
  const phones = [
    { label: "تلفن", value: s?.phone, Icon: Phone },
    { label: "شماره همراه", value: s?.phone2, Icon: Smartphone },
  ].filter((p) => p.value);

  return (
    <div className="lab-bg flex min-h-screen flex-col items-center px-4 pb-10">
      <div className="flex w-full max-w-md justify-end pt-4">
        <Link to="/admin" className="rounded-full border border-gold/30 px-3 py-1.5 text-[11px] text-gold/80">
          پنل مدیریت
        </Link>
      </div>

      <div className="relative mt-2 w-56">
        <img src={emblem} alt={`لوگوی ${name}`} width={1024} height={768} className="w-full" />
        <span className="gold-text absolute inset-0 grid place-items-center pt-6 text-xl font-black">{name}</span>
      </div>

      <h1 className="mt-3 text-center text-2xl font-black text-gold md:text-3xl">{name}</h1>
      <p className="mt-2 text-sm text-gold/90">سامانه استعلام عیار طلا</p>

      <form onSubmit={submit} className="mt-8 w-full max-w-md rounded-3xl p-3 shadow-2xl">
        <div className="flex items-center gap-2 rounded-full border-2 border-gold/40 bg-background/30 p-1.5 focus-within:border-gold">
          <input
            dir="ltr"
            inputMode="numeric"
            maxLength={40}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="کد استعلام"
            aria-label="کد استعلام"
            className="min-w-0 flex-1 bg-transparent px-4 py-2 text-center font-mono text-lg outline-none placeholder:text-muted-foreground/60"
          />
          <button
            disabled={loading}
            aria-label="استعلام"
            className="bg-gold-gradient grid size-10 shrink-0 place-items-center rounded-full text-primary-foreground disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          </button>
        </div>
      </form>

      {(item || notFound) && (
        <div className="rise mt-4 w-full max-w-md">
          {item ? (
            <div className="lab-card rounded-2xl p-5">
              <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-up">
                <ShieldCheck className="size-4" /> نتیجه تعیین عیار
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-muted-foreground">عیار</div>
                <div className="gold-text font-mono text-6xl font-bold leading-tight">{toFaDigits(item.result)}</div>
              </div>
              <dl className="mt-4 divide-y divide-border/60 border-t border-border/60 text-sm">
                {[
                  ["کد", toFaDigits(item.code)],
                  ["نوع", item.title || "طلا"],
                  ["وزن", item.weight ? toFaDigits(item.weight) : "—"],
                  ["تاریخ ثبت", faDate(item.created_at)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              {item.notes && <p className="mt-3 text-center text-sm text-muted-foreground">{item.notes}</p>}
            </div>
          ) : (
            <div className="lab-card rounded-2xl p-5 text-center">
              <div className="font-bold text-gold">کدی با این شماره ثبت نشده است</div>
              <p className="mt-1 text-sm text-muted-foreground">کد را دوباره بررسی کنید یا با ما تماس بگیرید.</p>
            </div>
          )}
        </div>
      )}

      {phones.length > 0 && (
        <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-3">
          {phones.map(({ label, value, Icon }) => (
            <div key={label} className="lab-card relative rounded-2xl px-3 pb-5 pt-9 text-center">
              <div className="bg-gold-gradient absolute -top-6 left-1/2 grid size-12 -translate-x-1/2 place-items-center rounded-full text-primary-foreground">
                <Icon className="size-5" />
              </div>
              <div className="text-sm text-muted-foreground">{label}</div>
              <a href={`tel:${toEnDigits(value!)}`} dir="ltr" className="mt-3 block font-mono font-bold text-gold underline underline-offset-4">
                {value}
              </a>
            </div>
          ))}
        </div>
      )}

      {s?.address && (
        <div className="mt-3 flex w-full max-w-md items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 text-gold" /> {s.address}
        </div>
      )}

      {socials.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {socials.map((x) => (
            <a
              key={x.key}
              href={socialHref(x.key, s!.socials[x.key] ?? "")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={x.label}
              className="grid size-10 place-items-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10"
            >
              <SocialIcon name={x.key} />
            </a>
          ))}
        </div>
      )}

      <footer className="mt-8 text-center text-xs text-gold/80">
        © {toFaDigits(String(new Date().getFullYear() - 621))} تمامی حقوق محفوظ است | {name}
      </footer>
    </div>
  );
}
