import { describe, expect, it } from "vitest";
import { site } from "@/lib/site";
import { getNextTheme, normalizeTheme } from "@/lib/theme";

describe("site theme and positioning", () => {
  it("normalizes persisted theme values and toggles deterministically", () => {
    expect(normalizeTheme("dark")).toBe("dark");
    expect(normalizeTheme("light")).toBe("light");
    expect(normalizeTheme("sepia")).toBeNull();
    expect(getNextTheme("light")).toBe("dark");
    expect(getNextTheme("dark")).toBe("light");
  });

  it("positions the library around strategy as well as building, use, and governance", () => {
    expect(site.tagline).toContain("building and using AI");
    expect(site.tagline).toContain("setting strategy");
    expect(site.tagline).toContain("governing it responsibly");
    expect(site.description).toContain(site.tagline);
  });
});
