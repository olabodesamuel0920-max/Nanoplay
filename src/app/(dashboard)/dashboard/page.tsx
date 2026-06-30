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
import AtmosphereLayer from "@/components/AtmosphereLayer";

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
        <AtmosphereLayer variant="dashboard" />
        <div className={styles.container}>
          {/* Welcome row */}
          <div className={styles.welcomeRow}>
            <div>
              <div className={styles.controlRoomHeader}>
                <span className={styles.matchdayControlBadge}>
                  <span className={styles.badgePulse} />
                  MATCHDAY CONTROL ROOM
                </span>
              </div>
              <h1 className={styles.title}>WELCOME BACK, {profile?.username ? profile.username.toUpperCase() : "PLAYER"}</h1>
              <p className={styles.subtitle}>
                Track your active challenges, prediction win streak, and account verification limits.
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
              <span className={styles.cardWatermark} aria-hidden="true" />
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
              <span className={styles.cardWatermark} aria-hidden="true" />
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
              <span className={styles.cardWatermark} aria-hidden="true" />
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
                <span className={styles.cardWatermark} aria-hidden="true" />
                <span className={styles.cardTexture} aria-hidden="true" />
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

                    {/* Streak Progress Mini-Bar */}
                    <div className={styles.streakVisualContainer}>
                      <div className={styles.streakVisualLabel}>
                        <span>Prediction Streak Progress</span>
                        <span className="font-data">{activeEntry?.streak_count || 0} / 3 Wins</span>
                      </div>
                      <div className={styles.streakProgressBarBg}>
                        <div 
                          className={styles.streakProgressBarFill} 
                          style={{ width: `${Math.min(100, ((activeEntry?.streak_count || 0) / 3) * 100)}%` }} 
                        />
                      </div>
                      <div className={styles.streakDots}>
                        {[1, 2, 3].map((step) => {
                          const isFilled = (activeEntry?.streak_count || 0) >= step;
                          return (
                            <span 
                              key={step} 
                              className={[
                                styles.streakDot, 
                                isFilled ? styles.streakDotFilled : ""
                              ].join(" ")} 
                              title={`Win ${step}`}
                            />
                          );
                        })}
                      </div>
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

              {/* Quick Actions Panel */}
              <GlassCard className={styles.quickActionsCard} style={{ marginTop: '24px' }} hoverEffect={false}>
                <span className={styles.cardWatermark} aria-hidden="true" />
                <div className={styles.cardHeader}>
                  <Zap className={styles.cardHeaderIcon} />
                  <h3>Lobby Quick Actions</h3>
                </div>
                <div className={styles.quickActionsGrid}>
                  <Link href="/arena" className={styles.quickActionBtn}>
                    <span className={styles.actionIcon}>⚽</span>
                    <span className={styles.actionName}>Enter Arena</span>
                  </Link>
                  <Link href="/settings" className={styles.quickActionBtn}>
                    <span className={styles.actionIcon}>📱</span>
                    <span className={styles.actionName}>Verify Phone</span>
                  </Link>
                  <Link href="/wallet" className={styles.quickActionBtn}>
                    <span className={styles.actionIcon}>💳</span>
                    <span className={styles.actionName}>View Wallet</span>
                  </Link>
                  <Link href="/referrals" className={styles.quickActionBtn}>
                    <span className={styles.actionIcon}>🤝</span>
                    <span className={styles.actionName}>Invite Friend</span>
                  </Link>
                </div>
              </GlassCard>
            </div>

            {/* Right Column: Profile Overview */}
            <div className={styles.rightColumn}>
              <GlassCard className={styles.profileCard}>
                <span className={styles.cardWatermark} aria-hidden="true" />
                <div className={styles.cardHeader}>
                  <User className={styles.cardHeaderIcon} />
                  <h3>Player Checklists</h3>
                </div>

                {/* Checklist */}
                <div className={styles.checklist}>
                  <div className={[styles.checklistItem, styles.checklistDone].join(" ")}>
                    <CheckCircle size={15} className={styles.checkIcon} />
                    <span>Create Player Account</span>
                  </div>
                  <div className={[styles.checklistItem, profile?.phone_verified ? styles.checklistDone : ""].join(" ")}>
                    {profile?.phone_verified ? <CheckCircle size={15} className={styles.checkIcon} /> : <div className={styles.todoCircle} />}
                    <span>Verify Phone Number</span>
                  </div>
                  <div className={[styles.checklistItem, activeEntry ? styles.checklistDone : ""].join(" ")}>
                    {activeEntry ? <CheckCircle size={15} className={styles.checkIcon} /> : <div className={styles.todoCircle} />}
                    <span>Select Challenge Pass & Predict</span>
                  </div>
                  <div className={[styles.checklistItem, profile?.identity_status === "verified" ? styles.checklistDone : ""].join(" ")}>
                    {profile?.identity_status === "verified" ? <CheckCircle size={15} className={styles.checkIcon} /> : <div className={styles.todoCircle} />}
                    <span>Verify Payout Identity</span>
                  </div>
                </div>

                <div className={styles.cardHeader} style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
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
