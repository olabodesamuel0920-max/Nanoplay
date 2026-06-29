// src/app/(admin)/admin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { Shield, Trophy, Landmark, Users, ShieldAlert, FileCheck, DollarSign } from "lucide-react";
import styles from "./page.module.css";

export default function AdminOverviewPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 0,
    phoneVerified: 0,
    totalDeposits: 0,
    pendingPayouts: 0,
    flaggedUsers: 0,
    pendingKyc: 0,
    activeRound: "None",
    pendingWinners: 0,
    launchMode: "preview",
    fundingEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminMetrics() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Assert Admin status
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // Fetch Total Users count
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch Phone Verified count
      const { count: phoneVerifiedCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("phone_verified", true);

      // Fetch Pending Payouts count
      const { count: payoutCount } = await supabase
        .from("payout_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Fetch Flagged/Suspicious Users count (Risk score >= 70 or suspended)
      const { count: flaggedCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .or("risk_score.gte.70,status.eq.under_review");

      // Fetch Pending KYC reviews count
      const { count: kycCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("identity_status", "pending");

      // Fetch Pending Winners count
      const { count: pendingWinnersCount } = await supabase
        .from("winners")
        .select("*", { count: "exact", head: true })
        .eq("verified", false);

      // Fetch Active Round number
      const { data: activeRoundData } = await supabase
        .from("challenge_rounds")
        .select("round_number")
        .eq("is_active", true)
        .maybeSingle();

      // Fetch Platform settings
      const { data: platformSettings } = await supabase
        .from("platform_settings")
        .select("key,value");

      const settingsMap: { [key: string]: any } = {};
      platformSettings?.forEach((s: any) => {
        try {
          settingsMap[s.key] = JSON.parse(s.value);
        } catch {
          settingsMap[s.key] = s.value;
        }
      });

      // Fetch Total Deposits volume
      const { data: deposits } = await supabase
        .from("wallet_transactions")
        .select("amount")
        .eq("type", "deposit")
        .eq("status", "confirmed");

      const depositVolume = deposits?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

      setMetrics({
        totalUsers: userCount || 0,
        phoneVerified: phoneVerifiedCount || 0,
        totalDeposits: depositVolume,
        pendingPayouts: payoutCount || 0,
        flaggedUsers: flaggedCount || 0,
        pendingKyc: kycCount || 0,
        activeRound: activeRoundData ? `Round #${activeRoundData.round_number}` : "None",
        pendingWinners: pendingWinnersCount || 0,
        launchMode: settingsMap["launch_mode"] || "preview",
        fundingEnabled: settingsMap["wallet_funding_enabled"] || false,
      });
      setLoading(false);
    }
    loadAdminMetrics();
  }, []);

  const adminNav = [
    { name: "Overview", path: "/admin", icon: Shield, active: true },
    { name: "Challenges", path: "/admin/challenges", icon: Trophy, active: false },
    { name: "KYC & Payouts", path: "/admin/kyc-payouts", icon: FileCheck, active: false },
    { name: "Security & Fraud", path: "/admin/security", icon: ShieldAlert, active: false },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-center" style={{ flex: 1 }}>
          <div className="font-data">LOADING ADMIN CONTROL PANEL...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Admin Header & Nav */}
          <div className={styles.adminHeader}>
            <div>
              <h1 className={styles.title}>Admin Control Center</h1>
              <p className={styles.subtitle}>Manage matches, review winners, audit payouts, and adjust security parameters.</p>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className={styles.tabNav}>
            {adminNav.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={[styles.tabItem, tab.active ? styles.tabActive : ""].join(" ")}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>

          {/* KPI Grid */}
          <div className={styles.metricsGrid}>
            <GlassCard className={styles.metricCard}>
              <Users className={styles.metricIcon} />
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>Total Members</span>
                <span className={[styles.metricValue, "font-data"].join(" ")}>
                  {metrics.totalUsers} <span style={{ fontSize: "11px", color: "var(--foreground-muted)" }}>({metrics.phoneVerified} Verified)</span>
                </span>
              </div>
            </GlassCard>

            <GlassCard className={styles.metricCard}>
              <DollarSign className={styles.metricIcon} style={{ color: "var(--accent-gold)" }} />
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>Deposited Funds</span>
                <span className={[styles.metricValue, "font-data"].join(" ")}>
                  NGN {metrics.totalDeposits.toLocaleString()}
                </span>
              </div>
            </GlassCard>

            <GlassCard className={styles.metricCard}>
              <Landmark className={styles.metricIcon} style={{ color: "#fbbf24" }} />
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>Pending Payouts</span>
                <span className={[styles.metricValue, "font-data"].join(" ")}>
                  {metrics.pendingPayouts} Requests
                </span>
              </div>
            </GlassCard>

            <GlassCard className={styles.metricCard}>
              <Trophy className={styles.metricIcon} style={{ color: "var(--accent-cyan)" }} />
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>Active Round</span>
                <span className={[styles.metricValue, "font-data"].join(" ")}>
                  {metrics.activeRound}
                </span>
              </div>
            </GlassCard>
          </div>

          {/* Launch Control Panel */}
          <div style={{ marginTop: "24px" }}>
            <GlassCard style={{ padding: "20px 24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "900", marginBottom: "16px", color: "var(--accent-gold)" }}>Launch Controls</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                <div>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Launch Mode</span>
                  <strong style={{ fontSize: "16px", textTransform: "capitalize", color: "var(--foreground-primary)" }}>{metrics.launchMode}</strong>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Wallet Funding</span>
                  <strong style={{ fontSize: "16px", color: metrics.fundingEnabled ? "var(--status-success)" : "var(--status-danger)" }}>
                    {metrics.fundingEnabled ? "ENABLED" : "DISABLED"}
                  </strong>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pending Winners Queue</span>
                  <strong style={{ fontSize: "16px", color: metrics.pendingWinners > 0 ? "var(--accent-cyan)" : "var(--foreground-primary)" }}>
                    {metrics.pendingWinners} Winner Requests
                  </strong>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Alert Queue Status */}
          <div className={styles.queuesGrid}>
            <GlassCard className={styles.queueCard} accent={metrics.pendingKyc > 0}>
              <h3 className={styles.queueTitle}>KYC Verification queue</h3>
              <p className={styles.queueDesc}>
                There are currently <strong>{metrics.pendingKyc}</strong> identity verification requests pending manual approval.
              </p>
              <Link href="/admin/kyc-payouts" className="btn-premium">
                Open KYC Queue
              </Link>
            </GlassCard>

            <GlassCard className={styles.queueCard} accent={metrics.flaggedUsers > 0}>
              <h3 className={styles.queueTitle}>Security Review queue</h3>
              <p className={styles.queueDesc}>
                There are currently <strong>{metrics.flaggedUsers}</strong> accounts flagged for duplicate bank details or high risk.
              </p>
              <Link href="/admin/security" className="btn-glass">
                Open Security Dashboard
              </Link>
            </GlassCard>
          </div>
        </div>
      </main>
    </>
  );
}
