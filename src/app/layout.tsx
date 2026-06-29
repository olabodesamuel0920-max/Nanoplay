// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Playfair_Display } from "next/font/google";
import MobileBottomNav from "@/components/layouts/mobile-bottom-nav";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NanoPlay | Elite Football Prediction Arena",
  description: "Enter the elite sports-tech football prediction challenge. Verify your phone, build your winning streak, and claim your rewards securely.",
  metadataBase: new URL("https://nanoplay.vercel.app"),
  openGraph: {
    title: "NanoPlay | Elite Football Prediction Arena",
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
      className={`${bebasNeue.variable} ${inter.variable} ${playfairDisplay.variable}`}
      style={{
        "--font-heading": "var(--font-bebas-neue)",
        "--font-body": "var(--font-inter)",
        "--font-data": "var(--font-inter)",
        "--font-editorial": "var(--font-playfair-display)",
      } as React.CSSProperties}
    >
      <body>
        <div className="main-layout">
          {children}
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
