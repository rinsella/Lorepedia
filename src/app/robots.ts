import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/explore", "/w/"], disallow: ["/dashboard", "/admin", "/superadmin", "/api"] },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
