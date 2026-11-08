export const WORKSHOP_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export function workshopPhotoError(file: { size: number; type: string }) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "عکس باید از نوع JPG، PNG یا WebP باشد.";
  if (file.size > WORKSHOP_PHOTO_MAX_BYTES) return "حجم عکس باید حداکثر ۵ مگابایت باشد.";
  return null;
}