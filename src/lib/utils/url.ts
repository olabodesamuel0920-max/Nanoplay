// src/lib/utils/url.ts

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  const url = 
    process.env.NEXT_PUBLIC_APP_URL || 
    process.env.NEXT_PUBLIC_SITE_URL || 
    "https://nanoplay.vercel.app";
    
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
