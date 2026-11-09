import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPublishedWorkshopPhoto } from "./workshop-photo.functions";

export type Settings = {
  name: string;
  workshop_photo_path: string;
  workshop_photo_url?: string;
  tagline: string;
  about: string;
  phone: string;
  phone2: string;
  address: string;
  socials: Record<string, string>;
};

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<Settings> => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    let workshop_photo_url = "";
    if (data.workshop_photo_path) {
      workshop_photo_url = await getPublishedWorkshopPhoto().catch(() => "");
    }
    return { ...data, workshop_photo_url, socials: (data.socials ?? {}) as Record<string, string> };
  },
  staleTime: 30 * 60 * 1000,
  refetchInterval: 30 * 60 * 1000,
});

export function toEnDigits(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}
export function toFaDigits(s: string | number) {
  return String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d] ?? d);
}
export function faDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
