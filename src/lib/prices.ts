import { queryOptions } from "@tanstack/react-query";

export type PriceItem = {
  key: string;
  label: string;
  unit: string;
  value: string;
  change: string;
  direction: "up" | "down" | "flat";
};

export type PricesPayload = {
  source: "live" | "manual";
  updatedAt: string;
  items: PriceItem[];
};

export const pricesQuery = queryOptions({
  queryKey: ["gold_prices"],
  queryFn: async (): Promise<PricesPayload> => {
    const res = await fetch("/api/public/gold-prices");
    if (!res.ok) throw new Error("prices fetch failed");
    return (await res.json()) as PricesPayload;
  },
  refetchInterval: 60_000,
  staleTime: 30_000,
});
