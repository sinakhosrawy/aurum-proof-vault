import { describe, expect, it } from "vitest";
import { workshopPhotoError } from "@/lib/workshop-photo";
describe("workshop image validation", () => {
  it("accepts supported bitmap images and rejects active content", () => {
    expect(workshopPhotoError({ type: "image/jpeg", size: 100 })).toBeNull();
    expect(workshopPhotoError({ type: "image/svg+xml", size: 100 })).not.toBeNull();
  });
  it("rejects files exceeding the storage upload limit", () => {
    expect(workshopPhotoError({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).not.toBeNull();
  });
});