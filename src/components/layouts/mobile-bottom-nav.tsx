// src/components/layouts/mobile-bottom-nav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, LayoutDashboard, Wallet, Award, Settings } from "lucide-react";
import styles from "./mobile-bottom-nav.module.css";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on home, auth, admin, and utility routes
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/auth");
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  const isUtility = pathname.startsWith("/faq") || pathname.startsWith("/terms") || pathname.startsWith("/privacy") || pathname.startsWith("/rules") || pathname.startsWith("/security") || pathname.startsWith("/tiers");

  if (isAuth || isAdmin || isHome || isUtility) {
    return null;
  }

  const navItems = [
    { label: "Arena", href: "/arena", icon: "⚽" },
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Wallet", href: "/wallet", icon: "💰" },
    { label: "Winners", href: "/winners", icon: "🏆" },
    { label: "Menu", href: "/settings", icon: "☰" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0b0b0e]/95 backdrop-blur-xl border-t border-[#1a1a1a] z-50 flex items-center justify-around px-2 pb-safe" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px', backgroundColor: 'rgba(11, 11, 14, 0.95)', backdropFilter: 'blur(24px)', borderTop: '1px solid #1a1a1a', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[44px] rounded-lg ${
              isActive ? "text-[#D4A853]" : "text-slate-500"
            }`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', minWidth: '48px', minHeight: '44px', textDecoration: 'none', color: isActive ? '#D4A853' : '#64748b' }}
          >
            <span className="text-lg" style={{ fontSize: '18px' }}>{item.icon}</span>
            <span className="text-[10px] font-medium" style={{ fontSize: '10px', fontWeight: 500 }}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
