import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Radio } from "lucide-react";
import { pricesQuery } from "@/lib/prices";
import { toFaDigits } from "@/lib/site";
import { Candles } from "@/components/Candles";

function DirIcon({ d }: { d: "up" | "down" | "flat" }) {
  if (d === "up") return <TrendingUp className="size-4 text-up" />;
  if (d === "down") return <TrendingDown className="size-4 text-down" />;
  return <Minus className="size-4 text-muted-foreground" />;
}

export function PriceBoard() {
  const { data } = useQuery(pricesQuery);
  const items = data?.items ?? [];
  if (items.length === 0) return null;

  const time = data?.updatedAt
    ? new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(new Date(data.updatedAt))
    : "";

  return (
    <section className="mt-14">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <span className="relative flex size-2.5">
            <span className="live-dot absolute inline-flex size-full rounded-full bg-up" />
            <span className="relative inline-flex size-2.5 rounded-full bg-up" />
          </span>
          مانیتور <span className="gold-text">قیمت زنده طلا</span>
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Radio className="size-3.5" />
          {data?.source === "live" ? "به‌روزرسانی خودکار" : "به‌روزرسانی کارگاه"} {time && `· ${time}`}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p, i) => (
          <div key={p.key} className="glass group relative overflow-hidden rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
            <Candles count={16} seed={p.key.length * 7 + i} className="pointer-events-none absolute inset-0 h-full w-full opacity-10" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{p.label}</span>
                <DirIcon d={p.direction} />
              </div>
              <div className="gold-text mt-2 font-mono text-2xl font-bold tracking-tight" dir="ltr">
                {toFaDigits(p.value)}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{p.unit}</span>
                {p.change && (
                  <span className={p.direction === "up" ? "text-up" : p.direction === "down" ? "text-down" : "text-muted-foreground"} dir="ltr">
                    {p.direction === "up" ? "+" : p.direction === "down" ? "-" : ""}
                    {toFaDigits(p.change)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PriceTicker() {
  const { data } = useQuery(pricesQuery);
  const items = data?.items ?? [];
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div className="ticker-run flex w-max gap-8 whitespace-nowrap">
      {doubled.map((p, i) => (
        <span key={`${p.key}-${i}`} className="flex items-center gap-2 text-muted-foreground">
          <span className={p.direction === "down" ? "text-down" : "text-up"}>{p.direction === "down" ? "▼" : "▲"}</span>
          {p.label}
          <span className="font-mono text-foreground" dir="ltr">{toFaDigits(p.value)}</span>
        </span>
      ))}
    </div>
  );
}
