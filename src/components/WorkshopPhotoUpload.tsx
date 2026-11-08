import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { workshopPhotoError } from "@/lib/workshop-photo";

export function WorkshopPhotoUpload({ preview, onChange, onBusy }: { preview: string; onChange: (path: string) => void; onBusy: (busy: boolean) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  async function upload(file: File) {
    const validation = workshopPhotoError(file);
    if (validation) { toast.error(validation); return; }
    setBusy(true); onBusy(true);
    try {
      const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("workshop-photos").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data, error: previewError } = await supabase.storage.from("workshop-photos").createSignedUrl(path, 3600);
      if (previewError) throw previewError;
      setLocalPreview(data.signedUrl);
      onChange(path);
    } catch { toast.error("بارگذاری عکس انجام نشد؛ دوباره تلاش کنید."); }
    finally { setBusy(false); onBusy(false); }
  }
  const url = localPreview ?? preview;
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">عکس کارگاه</div>
      {url && <img src={url} alt="پیش‌نمایش عکس کارگاه" className="aspect-[16/9] max-h-64 w-full rounded-lg border border-border object-contain" />}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="انتخاب عکس کارگاه" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>{busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}{url ? "تغییر عکس" : "انتخاب عکس"}</Button>
        {url && <Button type="button" variant="ghost" disabled={busy} onClick={() => { setLocalPreview(""); onChange(""); }}><Trash2 />حذف عکس</Button>}
        <span className="text-xs text-muted-foreground">JPG · PNG · WebP — حداکثر ۵ مگابایت</span>
      </div>
    </div>
  );
}