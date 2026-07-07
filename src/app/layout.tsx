// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import MobileBottomNav from "@/components/layouts/mobile-bottom-nav";
import "./globals.css";
import "@/components/AtmosphereLayer.css";

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
      className=""
      suppressHydrationWarning={true}
      style={{
        "--font-plus-jakarta-sans": "Plus Jakarta Sans, system-ui, sans-serif",
        "--font-space-mono": "Space Mono, monospace",
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
