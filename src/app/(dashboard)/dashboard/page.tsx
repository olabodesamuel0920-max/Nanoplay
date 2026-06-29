// src/app/(dashboard)/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateProfile } from "@/app/actions/verification";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { User, Wallet, Users, Award, ShieldAlert, CheckCircle, Zap, Trophy, HelpCircle } from "lucide-react";
import styles from "./page.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [predictionsCount, setPredictionsCount] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Fetch profile
      const res = await getOrCreateProfile();
      let profileData = null;
      if (res.ok && res.profile) {
        profileData = res.profile;
        setProfile(profileData);
      }

      // Fetch wallet
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setWallet(walletData);

      // Fetch active entry
      const { data: entryData } = await supabase
        .from("challenge_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (entryData) {
        setActiveEntry(entryData);

        // Fetch predictions count
        const { count } = await supabase
          .from("predictions")
          .select("*", { count: "exact", head: true })
          .eq("entry_id", entryData.id);
        setPredictionsCount(count || 0);
      }

      // Fetch referrals count
      const { count: refCount } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id);
      setReferralsCount(refCount || 0);

      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-center" style={{ flex: 1 }}>
          <div className="font-data">LOADING DASHBOARD...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Welcome row */}
          <div className={styles.welcomeRow}>
            <div>
              <h1 className={styles.title}>WELCOME BACK</h1>
              <p style={{ fontSize: "14px", color: "var(--accent-gold)", fontWeight: "600", marginTop: "2px", textTransform: "lowercase" }}>
                {profile?.username || "player"}
              </p>
              <p className={styles.subtitle} style={{ marginTop: "4px" }}>
                Track your active challenges, streak stats, and account limits.
              </p>
            </div>
            {profile?.role === "admin" && (
              <Link href="/admin" className="btn-premium">
                Admin Console
              </Link>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className={styles.statsGrid}>
            <GlassCard className={styles.statCard}>
              <div className={styles.statIconContainer}>
                <Wallet className={styles.statIcon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Wallet Balance</span>
                <span className={[styles.statValue, "font-data"].join(" ")}>
                  NGN {(wallet?.balance_ngn || 0).toLocaleString()}
                </span>
              </div>
            </GlassCard>

            <GlassCard className={styles.statCard}>
              <div className={styles.statIconContainer}>
                <Trophy className={styles.statIcon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Active Streak</span>
                <span className={[styles.statValue, "font-data"].join(" ")}>
                  {activeEntry?.streak_count || 0} Wins
                </span>
              </div>
            </GlassCard>

            <GlassCard className={styles.statCard}>
              <div className={styles.statIconContainer}>
                <Users className={styles.statIcon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Referrals</span>
                <span className={[styles.statValue, "font-data"].join(" ")}>
                  {referralsCount} Users
                </span>
              </div>
            </GlassCard>
          </div>

          {/* Verification Warning banner */}
          {!profile?.phone_verified && (
            <div className={styles.verificationBanner}>
              <ShieldAlert className={styles.bannerIcon} />
              <div className={styles.bannerText}>
                <strong>Phone Verification Required:</strong> Verify your phone number via OTP to submit predictions and participate in active rounds.
              </div>
              <Link href="/settings" className="btn-glass">
                Verify Phone
              </Link>
            </div>
          )}

          {/* Dashboard Main Grid */}
          <div className={styles.mainGrid}>
            {/* Left Column: Play Status */}
            <div className={styles.leftColumn}>
              <GlassCard className={styles.challengeCard}>
                <div className={styles.cardHeader}>
                  <Zap className={styles.cardHeaderIcon} />
                  <h3>Active Challenge Entry</h3>
                </div>

                {activeEntry ? (
                  <div className={styles.entryDetails}>
                    <div className={styles.detailRow}>
                      <span>Round Status:</span>
                      <span className="badge badge-premium">Active Round</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Submitted Predictions:</span>
                      <span className="font-data">{predictionsCount} / 3 Matches</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Target Round Reward:</span>
                      <span className={styles.rewardPotential}>Listed Tier Reward</span>
                    </div>

                    <div className={styles.ctaRow}>
                      <Link href="/arena" className="btn-premium" style={{ width: "100%" }}>
                        Manage Predictions
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noEntryDetails}>
                    <Trophy className={styles.noEntryIcon} />
                    <h4>You are not enrolled in the current round</h4>
                    <p>Enroll today in the Play Arena to start your 3-match prediction streak.</p>
                    <Link href="/arena" className="btn-premium">
                      Enroll Now
                    </Link>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Right Column: Profile Overview */}
            <div className={styles.rightColumn}>
              <GlassCard className={styles.profileCard}>
                <div className={styles.cardHeader}>
                  <User className={styles.cardHeaderIcon} />
                  <h3>Security & Payout Status</h3>
                </div>

                <div className={styles.profileList}>
                  <div className={styles.profileRow}>
                    <span>Username:</span>
                    <strong>{profile?.username ? profile.username : (user?.email ? user.email.split("@")[0] : "Not set")}</strong>
                  </div>
                  
                  <div className={styles.profileRow}>
                    <span>Phone Verification:</span>
                    {profile?.phone_verified ? (
                      <span className={styles.statusSuccess}>
                        <CheckCircle size={16} /> Phone Verified
                      </span>
                    ) : (
                      <span className={styles.statusDanger}>
                        <ShieldAlert size={16} /> Unverified
                      </span>
                    )}
                  </div>

                  <div className={styles.profileRow}>
                    <span>Payout Verification:</span>
                    {profile?.identity_status === "verified" ? (
                      <span className="badge badge-success">Verified</span>
                    ) : profile?.identity_status === "pending" ? (
                      <span className="badge badge-warning">Pending Review</span>
                    ) : profile?.identity_status === "under_review" ? (
                      <span className="badge badge-warning">Under Review</span>
                    ) : profile?.identity_status === "rejected" ? (
                      <span className="badge badge-error">Rejected</span>
                    ) : (
                      <span className="badge badge-info">Unverified</span>
                    )}
                  </div>

                  {profile?.bank_account_flagged && (
                    <div className={styles.flaggedNotice}>
                      <ShieldAlert size={16} />
                      <span>Bank account flagged. Duplicate detected.</span>
                    </div>
                  )}

                  <div className={styles.profileCta}>
                    <Link href="/settings" className="btn-glass" style={{ width: "100%" }}>
                      Manage Verification
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
