import "./globals.css";
import { Toaster } from "sonner";
import React from "react";
import { viewport } from "@/config/metadata";

export { viewport };

// WebApplication 结构化数据（SEO）
const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "web-text",
  url: "https://web-text.ale160.com/",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  description:
    "简洁优雅的在线 Markdown 编辑器，支持实时预览、代码高亮、自动保存、多文档管理。100% 纯前端，数据保存在浏览器本地。",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CNY",
  },
  inLanguage: ["zh-CN", "en"],
  author: {
    "@type": "Person",
    name: "Ale",
    url: "https://ale160.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://ale160.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
