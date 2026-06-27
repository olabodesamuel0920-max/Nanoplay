// src/components/layouts/navbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Wallet, Users, Award, BookOpen, Shield, LogOut, Menu, X, User } from "lucide-react";
import Logo from "@/components/ui/logo";
import styles from "./navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUserSession() {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        
        // Fetch profile details
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();
        setProfile(profileData);

        // Fetch wallet balance
        const { data: walletData } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", data.session.user.id)
          .single();
        setWallet(walletData);
      }
    }
    fetchUserSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { name: "Arena", path: "/arena", icon: Trophy },
    { name: "Dashboard", path: "/dashboard", icon: User },
    { name: "Wallet", path: "/wallet", icon: Wallet },
    { name: "Referrals", path: "/referrals", icon: Users },
    { name: "Winners", path: "/winners", icon: Award },
    { name: "Rules", path: "/rules", icon: BookOpen },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logoContainer}>
          <Logo size={32} />
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={[styles.navItem, isActive ? styles.active : ""].join(" ")}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className={[styles.navItem, styles.adminLink, pathname.startsWith("/admin") ? styles.active : ""].join(" ")}
            >
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* User Actions */}
        <div className={styles.actions}>
          {user ? (
            <>
              <div className={styles.walletContainer}>
                <Wallet size={16} className={styles.walletIcon} />
                <span className={styles.balance}>
                  ₦{(wallet?.balance_ngn || 0).toLocaleString()}
                </span>
              </div>
              
              <Link href="/settings" className={styles.settingsLink} title="Account Settings">
                <div className={styles.avatar}>
                  {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
              </Link>

              <button onClick={handleLogout} className={styles.logoutBtn} title="Sign Out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.loginBtn}>
                Sign In
              </Link>
              <Link href="/signup" className={styles.signupBtn}>
                Join Arena ↗
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNav}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={[styles.mobileNavItem, isActive ? styles.active : ""].join(" ")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
             {profile?.role === "admin" && (
              <Link
                href="/admin"
                className={[styles.mobileNavItem, styles.adminLink].join(" ")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield size={20} />
                <span>Admin Panel</span>
              </Link>
            )}
            {user ? (
              <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className={styles.mobileAuthButtons}>
                <Link
                  href="/login"
                  className={styles.mobileLoginBtn}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={styles.mobileSignupBtn}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join Arena ↗
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
