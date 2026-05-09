import GithubSlugger from "github-slugger";

const slugger = new GithubSlugger();

export function slugify(input: string): string {
  slugger.reset();
  return slugger.slug(input.trim());
}

const RESERVED = new Set([
  "admin", "api", "auth", "dashboard", "explore", "login",
  "register", "logout", "settings", "superadmin", "world", "worlds",
  "page", "pages", "_next", "static", "uploads",
]);

export function isReservedSlug(s: string) {
  return RESERVED.has(s.toLowerCase());
}
