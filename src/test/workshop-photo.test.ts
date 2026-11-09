import { describe, expect, it, vi } from "vitest";
import { workshopPhotoError } from "@/lib/workshop-photo";
import { signPublishedWorkshopPhoto } from "@/lib/workshop-photo-public";
describe("workshop image validation", () => {
  it("accepts supported bitmap images and rejects active content", () => {
    expect(workshopPhotoError({ type: "image/jpeg", size: 100 })).toBeNull();
    expect(workshopPhotoError({ type: "image/svg+xml", size: 100 })).not.toBeNull();
  });
  it("rejects files exceeding the storage upload limit", () => {
    expect(workshopPhotoError({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).not.toBeNull();
  });
});
describe("controlled public workshop photo", () => {
  it("signs only the saved published path with a one-hour expiry", async () => {
    const signer = vi.fn().mockResolvedValue("signed-link");
    expect(await signPublishedWorkshopPhoto(async () => "admin/published.jpg", signer)).toBe("signed-link");
    expect(signer).toHaveBeenCalledExactlyOnceWith("admin/published.jpg", 3600);
  });
  it("does not sign an unpublished photo", async () => {
    const signer = vi.fn();
    expect(await signPublishedWorkshopPhoto(async () => "", signer)).toBe("");
    expect(signer).not.toHaveBeenCalled();
  });
  it("does not sign anything when public authorization cannot be read", async () => {
    const signer = vi.fn();
    await expect(signPublishedWorkshopPhoto(async () => { throw new Error("denied"); }, signer)).rejects.toThrow("denied");
    expect(signer).not.toHaveBeenCalled();
  });
});