// src/components/layouts/mobile-bottom-nav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, LayoutDashboard, Wallet, Award, Settings } from "lucide-react";
import styles from "./mobile-bottom-nav.module.css";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide only on admin routes
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
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
    <div className={styles.bottomNavContainer}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
