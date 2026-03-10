import type { MetadataRoute } from "next";

const BASE_URL = "https://getdictus.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/fr`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          fr: `${BASE_URL}/fr`,
          en: `${BASE_URL}/en`,
        },
      },
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: {
          fr: `${BASE_URL}/fr`,
          en: `${BASE_URL}/en`,
        },
      },
    },
  ];
}
