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
    { label: "Arena", href: "/arena", icon: Trophy },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Wallet", href: "/wallet", icon: Wallet },
    { label: "Winners", href: "/winners", icon: Award },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className={styles.bottomNavContainer}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
          >
            <Icon size={20} className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
