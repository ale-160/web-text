// 核心个人信息
export const PERSON_DATA_ZH = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ale",
  url: "https://ale160.com",
  sameAs: [
    "https://github.com/ale-160",
    "https://space.bilibili.com/325710677",
  ],
  jobTitle: "独立开发者 & 内容创作者",
  description: "从谷底出发，用代码和故事对抗命运。",
};

export const PERSON_DATA_EN = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ale",
  url: "https://ale160.com",
  sameAs: [
    "https://github.com/ale-160",
    "https://space.bilibili.com/325710677",
  ],
  jobTitle: "Independent Developer & Content Creator",
  description: "Rising from the bottom, fighting fate with code and stories.",
};

// 主站信息
export const WEBSITE_DATA_ZH = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "web-text",
  url: "https://web-text.ale160.com",
  description: "简洁优雅的在线 Markdown 编辑器",
  author: {
    "@type": "Person",
    name: "Ale"
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://web-text.ale160.com?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const WEBSITE_DATA_EN = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "web-text",
  url: "https://web-text.ale160.com",
  description: "Simple and elegant online Markdown editor",
  author: {
    "@type": "Person",
    name: "Ale"
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://web-text.ale160.com?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

// WebApplication 信息
export const WEBAPP_DATA_ZH = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "web-text",
  url: "https://web-text.ale160.com",
  description: "简洁优雅的在线 Markdown 编辑器，支持实时预览、代码高亮、自动保存",
  applicationCategory: "EditorApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CNY"
  },
  author: {
    "@type": "Person",
    name: "Ale"
  },
  sameAs: ["https://ale160.com"]
};

export const WEBAPP_DATA_EN = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "web-text",
  url: "https://web-text.ale160.com",
  description: "Simple and elegant online Markdown editor with real-time preview, syntax highlighting, and auto-save",
  applicationCategory: "EditorApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  author: {
    "@type": "Person",
    name: "Ale"
  },
  sameAs: ["https://ale160.com"]
};

export function getStructuredData(lang: string = "en") {
  const isEn = lang === "en";
  return [
    isEn ? PERSON_DATA_EN : PERSON_DATA_ZH,
    isEn ? WEBSITE_DATA_EN : WEBSITE_DATA_ZH,
    isEn ? WEBAPP_DATA_EN : WEBAPP_DATA_ZH,
  ];
}
