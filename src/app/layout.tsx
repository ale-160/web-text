import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import React from "react";

export const metadata: Metadata = {
  title: "web-text · 在线 Markdown 编辑器",
  description: "简洁优雅的在线 Markdown 编辑器，支持实时预览、代码高亮、自动保存",
  keywords: ["Markdown", "编辑器", "web-text", "在线编辑器"],
  icons: {
    icon: "https://ale160.com/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
