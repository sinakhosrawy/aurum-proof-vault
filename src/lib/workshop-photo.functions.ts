import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { signPublishedWorkshopPhoto } from "./workshop-photo-public";

// No caller-supplied file path: only the published settings row authorizes signing.
export const getPublishedWorkshopPhoto = createServerFn({ method: "GET" })
  .handler(async () => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("Workshop photo configuration unavailable");
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    return signPublishedWorkshopPhoto(async () => {
      const { data, error } = await client.from("site_settings")
        .select("workshop_photo_path").eq("id", 1).single();
      if (error) throw new Error("Published workshop photo unavailable");
      return data.workshop_photo_path;
    }, async (path, expiresIn) => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin.storage.from("workshop-photos")
        .createSignedUrl(path, expiresIn);
      if (error) throw new Error("Workshop photo link unavailable");
      return data.signedUrl;
    });
  });