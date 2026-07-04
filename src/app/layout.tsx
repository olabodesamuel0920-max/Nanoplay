// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import MobileBottomNav from "@/components/layouts/mobile-bottom-nav";
import "./globals.css";
import "@/components/AtmosphereLayer.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // suppressHydrationWarning is applied to <html> because data-theme is dynamically
  // determined on the client side via the inline script below to prevent flash of theme (FOUC).
  return (
    <html 
      lang="en" 
      className={`${plusJakartaSans.variable} ${spaceMono.variable}`}
      suppressHydrationWarning={true}
      style={{
        "--font-heading": "var(--font-plus-jakarta-sans)",
        "--font-body": "var(--font-plus-jakarta-sans)",
        "--font-data": "var(--font-space-mono)",
        "--font-editorial": "var(--font-plus-jakarta-sans)",
      } as React.CSSProperties}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <div className="main-layout">
          {children}
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
