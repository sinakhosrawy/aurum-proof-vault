export async function signPublishedWorkshopPhoto(
  readPublishedPath: () => Promise<string>,
  signPath: (path: string, expiresIn: number) => Promise<string>,
) {
  const path = await readPublishedPath();
  if (!path) return "";
  return signPath(path, 3600);
}