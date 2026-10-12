import type { MetadataRoute } from "next";
import { isSitePreview } from "@/config/preview";
import { isBlogPublic } from "@/config/blog";

export default function robots(): MetadataRoute.Robots {
  if (isSitePreview) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...(isBlogPublic ? [] : ["/fr/blog", "/en/blog"]), "/fr/pricing", "/en/pricing"],
    },
    sitemap: "https://getdictus.com/sitemap.xml",
  };
}
