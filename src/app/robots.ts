import type { MetadataRoute } from "next";
import { isSitePreview } from "@/config/preview";

export default function robots(): MetadataRoute.Robots {
  if (isSitePreview) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/fr/blog", "/en/blog", "/fr/pricing", "/en/pricing"],
    },
    sitemap: "https://getdictus.com/sitemap.xml",
  };
}
