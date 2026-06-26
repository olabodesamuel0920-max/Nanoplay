// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NanoPlay | Premium Football Prediction Platform",
  description: "Join the ultimate premium sports-tech football prediction challenge. Climb the arena, secure streaks, and claim your rewards with trust-validated ledger wallets.",
  metadataBase: new URL("https://nanoplay.com"),
  openGraph: {
    title: "NanoPlay | Premium Football Prediction Platform",
    description: "Join the ultimate premium sports-tech football prediction challenge.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      style={{
        "--font-heading": "var(--font-sora)",
        "--font-body": "var(--font-inter)",
        "--font-data": "var(--font-jetbrains-mono)",
      } as React.CSSProperties}
    >
      <body>
        <div className="main-layout">
          {children}
        </div>
      </body>
    </html>
  );
}
