import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { site } from "@/lib/site";

/**
 * Crawlers get the whole catalogue and nothing else. /admin is private, and
 * /read is a viewer for pages already indexed at /books/[slug] — letting both
 * be crawled would only split ranking signals.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Locale-prefixed, and the bare paths too in case a crawler finds one
        // before the redirect.
        disallow: [
          "/admin",
          "/read/",
          ...locales.flatMap((lang) => [`/${lang}/admin`, `/${lang}/read/`]),
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
