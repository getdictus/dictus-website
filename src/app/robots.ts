import type { MetadataRoute } from "next";
import { isSitePreview } from "@/config/preview";
import { isBlogPublic } from "@/config/blog";
import { isPricingPublic } from "@/config/pricing-release";
import { SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (isSitePreview) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        ...(isBlogPublic ? [] : ["/fr/blog", "/en/blog"]),
        ...(isPricingPublic ? [] : ["/fr/pricing", "/en/pricing"]),
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
