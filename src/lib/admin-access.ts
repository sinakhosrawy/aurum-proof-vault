export const ADMIN_EMAIL = "sinakhosravi2025@gmail.com";

// A UI precheck only; database has_role remains the authority for permissions.
export function isAllowedAdminEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}