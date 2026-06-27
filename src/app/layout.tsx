// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Outfit, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NanoPlay | Premium Football Prediction Streak Arena",
  description: "Enter the elite sports-tech football prediction challenge. Verify your phone, build your winning streak, and claim your verified rewards through an immutable transaction ledger.",
  metadataBase: new URL("https://nanoplay.com"),
  openGraph: {
    title: "NanoPlay | Premium Football Prediction Streak Arena",
    description: "Enter the elite sports-tech football prediction challenge.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050507",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{
        "--font-heading": "var(--font-outfit)",
        "--font-body": "var(--font-space-grotesk)",
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
