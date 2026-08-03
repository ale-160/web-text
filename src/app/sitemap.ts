import type { MetadataRoute } from "next";

// 站点地图：每次构建自动生成 out/sitemap.xml，无需手动维护
const BASE_URL = "https://web-text.ale160.com";

// output: export 模式要求 metadata 路由显式静态
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: `${BASE_URL}/`,
          zh: `${BASE_URL}/zh/`,
          "x-default": `${BASE_URL}/`,
        },
      },
    },
    {
      url: `${BASE_URL}/zh/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${BASE_URL}/`,
          zh: `${BASE_URL}/zh/`,
          "x-default": `${BASE_URL}/`,
        },
      },
    },
  ];
}
