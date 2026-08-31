import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "每日日本語",
  description: "每天用 10 個單字與 3 個文法，從 JLPT N5 開始累積日文實力。",
  manifest: "./manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "每日日本語" },
  icons: {
    icon: "./favicon.svg",
    shortcut: "./favicon.svg",
    apple: "./apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f0e6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
