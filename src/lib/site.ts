import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Settings = {
  name: string;
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
    return { ...data, socials: (data.socials ?? {}) as Record<string, string> };
  },
});

export function toEnDigits(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}
export function toFaDigits(s: string | number) {
  return String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}
export function faDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
