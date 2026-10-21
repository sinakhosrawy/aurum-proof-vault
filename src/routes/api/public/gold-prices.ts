import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type PriceItem = {
  key: string;
  label: string;
  unit: string;
  value: string;
  change: string;
  direction: "up" | "down" | "flat";
};

type Payload = { source: "live" | "manual"; updatedAt: string; items: PriceItem[] };

// Short-lived in-memory cache so every visitor doesn't hit the price API.
let cache: { at: number; payload: Payload } | null = null;
const CACHE_MS = 5 * 60 * 1000;

const LABELS: Record<string, { label: string; unit: string }> = {
  gold18: { label: "طلای ۱۸ عیار", unit: "تومان / گرم" },
  gold24: { label: "طلای ۲۴ عیار", unit: "تومان / گرم" },
  ounce: { label: "انس جهانی", unit: "دلار" },
  mesghal: { label: "مثقال طلا", unit: "تومان" },
  coin: { label: "سکه امامی", unit: "تومان" },
  halfcoin: { label: "نیم سکه", unit: "تومان" },
  quartercoin: { label: "ربع سکه", unit: "تومان" },
};

// Navasan free API key -> item key mapping
const NAVASAN_MAP: Record<string, string> = {
  "18ayar": "gold18",
  "24ayar": "gold24",
  ons: "ounce",
  mesghal: "mesghal",
  sekke: "coin",
  nim: "halfcoin",
  rob: "quartercoin",
};

async function fetchLive(): Promise<Payload | null> {
  const key = process.env["NAVASAN_API_KEY"];
  if (!key) return null;
  try {
    const res = await fetch(`http://api.navasan.tech/latest/?api_key=${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, { value?: string; change?: number; date?: string }>;
    const items: PriceItem[] = [];
    for (const [apiKey, itemKey] of Object.entries(NAVASAN_MAP)) {
      const row = data[apiKey];
      if (!row?.value) continue;
      const change = typeof row.change === "number" ? row.change : 0;
      items.push({
        key: itemKey,
        label: LABELS[itemKey]!.label,
        unit: LABELS[itemKey]!.unit,
        value: row.value,
        change: change === 0 ? "" : String(Math.abs(change)),
        direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
      });
    }
    if (items.length === 0) return null;
    return { source: "live", updatedAt: new Date().toISOString(), items };
  } catch {
    return null;
  }
}

async function fetchManual(): Promise<Payload> {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data } = await supabase.from("gold_prices").select("key, label, unit, value, change, direction, updated_at");
  const rows = (data ?? []) as Array<PriceItem & { updated_at: string }>;
  const items = rows
    .filter((r) => r.value)
    .map((r) => ({
      key: r.key,
      label: r.label,
      unit: r.unit,
      value: r.value,
      change: r.change,
      direction: (r.direction === "up" || r.direction === "down" ? r.direction : "flat") as PriceItem["direction"],
    }));
  const updatedAt = rows.reduce((m, r) => (r.updated_at > m ? r.updated_at : m), "");
  return { source: "manual", updatedAt: updatedAt || new Date().toISOString(), items };
}

export const Route = createFileRoute("/api/public/gold-prices")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        if (cache && now - cache.at < CACHE_MS) {
          return Response.json(cache.payload, { headers: { "cache-control": "public, max-age=60" } });
        }
        const live = await fetchLive();
        const payload = live ?? (await fetchManual());
        cache = { at: now, payload };
        return Response.json(payload, { headers: { "cache-control": "public, max-age=60" } });
      },
    },
  },
});
