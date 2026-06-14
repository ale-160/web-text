import { Metadata } from "next";

export const METADATA_ZH = {
  title: "web-text · 美观的在线 Markdown 编辑器",
  description: "简洁优雅的在线 Markdown 编辑器，支持实时预览、代码高亮、自动保存、暗色模式、多语言和本地存储。100% 纯前端，无需服务器。",
  keywords: [
    "web-text",
    "Markdown 编辑器",
    "在线 Markdown",
    "Markdown 预览",
    "实时预览",
    "代码高亮",
    "暗色模式",
    "双语",
    "隐私保护",
    "本地存储",
    "在线编辑器",
    "Markdown 工具",
    "文本编辑器",
    "Markdown 写作",
    "无需注册",
    "无需服务器",
    "纯前端",
    "中文",
    "英文"
  ],
  authors: [{ name: "Ale", url: "https://ale160.com" }],
  creator: "Ale",
  publisher: "Ale",
  openGraph: {
    title: "web-text · 美观的在线 Markdown 编辑器",
    description: "简洁优雅的在线 Markdown 编辑器，支持实时预览、代码高亮、自动保存、暗色模式和多语言。100% 纯前端。",
    url: "https://web-text.ale160.com/zh/",
    siteName: "web-text 官方网站",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "https://ale160.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "web-text 预览图"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "web-text · 美观的在线 Markdown 编辑器",
    description: "简洁优雅的在线 Markdown 编辑器，支持实时预览、代码高亮、自动保存、暗色模式和多语言。100% 纯前端。",
    images: ["https://ale160.com/og-image.png"],
    creator: "@ale160"
  },
  alternates: {
    canonical: "https://web-text.ale160.com/zh/",
    languages: {
      "en": "https://web-text.ale160.com/",
      "zh-CN": "https://web-text.ale160.com/zh/"
    }
  }
};

export const METADATA_EN = {
  title: "web-text · Beautiful Online Markdown Editor",
  description: "A beautiful, privacy-focused online Markdown editor with real-time preview, code highlighting, auto-save, dark mode, bilingual support, and local storage. 100% client-side, no server required.",
  keywords: [
    "web-text",
    "markdown editor",
    "online markdown",
    "markdown preview",
    "real-time preview",
    "code highlighting",
    "dark mode",
    "bilingual",
    "privacy focused",
    "local storage",
    "online editor",
    "markdown tool",
    "text editor",
    "markdown writer",
    "no registration",
    "no server",
    "client-side",
    "Chinese",
    "English"
  ],
  authors: [{ name: "Ale", url: "https://ale160.com" }],
  creator: "Ale",
  publisher: "Ale",
  openGraph: {
    title: "web-text · Beautiful Online Markdown Editor",
    description: "A beautiful, privacy-focused online Markdown editor with real-time preview, code highlighting, auto-save, dark mode, and bilingual support. 100% client-side.",
    url: "https://web-text.ale160.com/",
    siteName: "web-text Official Website",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ale160.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "web-text Preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "web-text · Beautiful Online Markdown Editor",
    description: "A beautiful, privacy-focused online Markdown editor with real-time preview, code highlighting, auto-save, dark mode, and bilingual support. 100% client-side.",
    images: ["https://ale160.com/og-image.png"],
    creator: "@ale160"
  },
  alternates: {
    canonical: "https://web-text.ale160.com/",
    languages: {
      "en": "https://web-text.ale160.com/",
      "zh-CN": "https://web-text.ale160.com/zh/"
    }
  }
};

export function getMetadata(lang: string = "en"): Metadata {
  const metadata = lang === "en" ? METADATA_EN : METADATA_ZH;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    authors: metadata.authors,
    creator: metadata.creator,
    publisher: metadata.publisher,
    icons: {
      icon: "https://ale160.com/favicon.ico",
    },
    formatDetection: {
      email: false,
      telephone: false,
    },
    openGraph: metadata.openGraph,
    twitter: metadata.twitter,
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    alternates: metadata.alternates,
  };
}

// Viewport配置
export const viewport = {
  width: "device-width",
  initialScale: 1,
};
