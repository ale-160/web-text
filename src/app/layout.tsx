import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import React from "react";

export const metadata: Metadata = {
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
  icons: {
    icon: "https://ale160.com/favicon.ico",
  },
  openGraph: {
    title: "web-text · Beautiful Online Markdown Editor",
    description: "A beautiful, privacy-focused online Markdown editor with real-time preview, code highlighting, auto-save, dark mode, and bilingual support. 100% client-side.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "web-text · Beautiful Online Markdown Editor",
    description: "A beautiful, privacy-focused online Markdown editor with real-time preview, code highlighting, auto-save, dark mode, and bilingual support. 100% client-side.",
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
