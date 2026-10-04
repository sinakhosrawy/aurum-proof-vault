export const SOCIALS = [
  { key: "instagram", label: "اینستاگرام", prefix: "https://instagram.com/" },
  { key: "telegram", label: "تلگرام", prefix: "https://t.me/" },
  { key: "whatsapp", label: "واتساپ", prefix: "https://wa.me/" },
  { key: "eitaa", label: "ایتا", prefix: "https://eitaa.com/" },
  { key: "rubika", label: "روبیکا", prefix: "https://rubika.ir/" },
  { key: "bale", label: "بله", prefix: "https://ble.ir/" },
  { key: "youtube", label: "یوتیوب", prefix: "https://youtube.com/@" },
  { key: "x", label: "ایکس", prefix: "https://x.com/" },
  { key: "facebook", label: "فیسبوک", prefix: "https://facebook.com/" },
  { key: "website", label: "وب‌سایت", prefix: "" },
] as const;

export type SocialKey = (typeof SOCIALS)[number]["key"];

export function socialHref(key: string, value: string) {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const s = SOCIALS.find((x) => x.key === key);
  const clean = v.replace(/^@/, "");
  return (s?.prefix || "https://") + clean;
}

const P: Record<string, string> = {
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
  telegram:
    "M9.8 15.2l-.4 5.3c.6 0 .8-.2 1.1-.5l2.6-2.5 5.4 4c1 .5 1.7.3 2-.9l3.6-17c.3-1.5-.6-2.1-1.6-1.7L1.2 9.9c-1.4.6-1.4 1.4-.2 1.8l5.4 1.7L19 5.5c.6-.4 1.1-.2.7.2z",
  whatsapp:
    "M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm0-21.6A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.7A11.8 11.8 0 1 0 12 .2z",
  youtube:
    "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z",
  x: "M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.8 2.3h7l4.8 6.4zm-1.2 17.9h1.9L7.1 4.2H5.1z",
  facebook:
    "M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z",
  website:
    "M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm7.9 7h-3.3a18 18 0 0 0-1.6-4.3A9.7 9.7 0 0 1 19.9 7zM12 2.4c.9 1.3 1.7 2.8 2.2 4.6H9.8c.5-1.8 1.3-3.3 2.2-4.6zM2.7 14a9.6 9.6 0 0 1 0-4h3.7a20 20 0 0 0 0 4zm.9 3h3.3c.4 1.6.9 3 1.6 4.3A9.7 9.7 0 0 1 3.6 17zM6.9 7H3.6a9.7 9.7 0 0 1 4.9-4.3C7.8 4 7.3 5.4 6.9 7zM12 21.6c-.9-1.3-1.7-2.8-2.2-4.6h4.4c-.5 1.8-1.3 3.3-2.2 4.6zm2.7-7.6H9.3a17.6 17.6 0 0 1 0-4h5.4a17.6 17.6 0 0 1 0 4zm.3 7.3c.7-1.3 1.2-2.7 1.6-4.3h3.3a9.7 9.7 0 0 1-4.9 4.3zm2.6-7.3a20 20 0 0 0 0-4h3.7a9.6 9.6 0 0 1 0 4z",
};
const LETTER: Record<string, string> = { eitaa: "ای", rubika: "ر", bale: "ب" };

export function SocialIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  if (P[name])
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
        <path d={P[name]} />
      </svg>
    );
  return <span className={`${className} grid place-items-center text-xs font-black leading-none`}>{LETTER[name] ?? "•"}</span>;
}
