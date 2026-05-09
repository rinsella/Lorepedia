import { describe, it, expect } from "vitest";
import { extractWikilinks, replaceWikilinks } from "@/lib/markdown";

describe("wikilinks", () => {
  it("extracts simple [[Title]]", () => {
    const links = extractWikilinks("Hello [[Kingdom of Arvandor]] world");
    expect(links).toHaveLength(1);
    expect(links[0].targetTitle).toBe("Kingdom of Arvandor");
    expect(links[0].targetSlug).toBe("kingdom-of-arvandor");
    expect(links[0].label).toBe("Kingdom of Arvandor");
  });

  it("extracts pipe-aliased [[Title|Label]]", () => {
    const links = extractWikilinks("See [[Queen Mirelle|her majesty]].");
    expect(links[0].label).toBe("her majesty");
    expect(links[0].targetTitle).toBe("Queen Mirelle");
  });

  it("renders resolved + broken wikilinks differently", () => {
    const out = replaceWikilinks("[[A]] and [[B]]", "world", new Set(["a"]));
    expect(out).toContain('class="wikilink"');
    expect(out).toContain("wikilink-broken");
  });
});
