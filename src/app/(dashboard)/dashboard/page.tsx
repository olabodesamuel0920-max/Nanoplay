// src/app/(dashboard)/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateProfile } from "@/app/actions/verification";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { Lock, HelpCircle, ShieldAlert, CheckCircle, Sparkles, Zap, Wallet, Flame, Users, Calendar, Info, User } from "lucide-react";
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
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);

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
      clearTimeout(timer);
    }
    loadDashboard();
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="skeleton-box" style={{ height: '2rem', width: '25%', marginBottom: '1.5rem' }}></div>
            
            {/* Stats row skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="skeleton-box" style={{ height: '7rem' }}></div>
              <div className="skeleton-box" style={{ height: '7rem' }}></div>
              <div className="skeleton-box" style={{ height: '7rem' }}></div>
            </div>

            {/* Main cards skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div className="skeleton-box" style={{ height: '20rem' }}></div>
              <div className="skeleton-box" style={{ height: '20rem' }}></div>
            </div>

            {showTimeout && (
              <div className="text-center py-4" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p className="text-sm mb-2" style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Taking longer than expected to load dashboard...</p>
                <button onClick={() => window.location.reload()} className="btn-premium" style={{ display: 'inline-flex', padding: '0.5rem 1rem' }}>
                  Refresh Page
                </button>
              </div>
            )}
          </div>
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
                  Matchday Control Room
                </span>
              </div>
              <h1 className={styles.title}>Welcome Back, {profile?.username ? profile.username : "Player"}</h1>
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
              <div className={styles.statIconContainer} style={{ borderColor: 'var(--border-gold)' }}>
                <Wallet className={styles.statIcon} style={{ color: 'var(--accent-gold)' }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Wallet Balance</span>
                <span className={[styles.statValue, "font-mono-numbers"].join(" ")} style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                  NGN {(wallet?.balance_ngn || 0).toLocaleString()}
                </span>
              </div>
            </GlassCard>

            <GlassCard className={styles.statCard}>
              <span className={styles.cardWatermark} aria-hidden="true" />
              <div className={styles.statIconContainer} style={{ borderColor: 'var(--border-green)' }}>
                <Flame className={styles.statIcon} style={{ color: 'var(--accent-green)' }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Active Streak</span>
                <span className={[styles.statValue, "font-mono-numbers"].join(" ")} style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                  {activeEntry?.streak_count || 0} Wins
                </span>
              </div>
            </GlassCard>

            <GlassCard className={styles.statCard}>
              <span className={styles.cardWatermark} aria-hidden="true" />
              <div className={styles.statIconContainer} style={{ borderColor: 'var(--border-cyan)' }}>
                <Users className={styles.statIcon} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Referrals</span>
                <span className={[styles.statValue, "font-mono-numbers"].join(" ")} style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
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
                      <span className="font-mono-numbers">{predictionsCount} / 3 Matches</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Target Round Reward:</span>
                      <span className={styles.rewardPotential}>Listed Tier Reward</span>
                    </div>

                    {/* Streak Progress Mini-Bar */}
                    <div className={styles.streakVisualContainer}>
                      <div className={styles.streakVisualLabel}>
                        <span>Prediction Streak Progress</span>
                        <span className="font-mono-numbers">{activeEntry?.streak_count || 0} / 3 Wins</span>
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
                  <div className="text-center py-16" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center" style={{ width: '5rem', height: '5rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1.5rem', borderRadius: '50%', backgroundColor: 'rgba(212, 168, 83, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar className="w-10 h-10 text-gold" style={{ width: '2.5rem', height: '2.5rem', color: 'var(--accent-gold)' }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2" style={{ color: 'var(--foreground-primary)', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Next Matchday: Arsenal vs Liverpool</h3>
                    <p className="text-slate-400 mb-2" style={{ color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>Starts in 2 days, 14 hours</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
                      <span>47 players enrolled</span>
                      <span>•</span>
                      <span>₦1,500 top reward</span>
                    </div>
                    <Link href="/arena" className="btn-premium" style={{ display: 'inline-flex' }}>
                      Set Your Predictions
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

              </GlassCard>
            </div>
          </div>

          {/* Security & Payout Status row at bottom (PART 3 - 2) */}
          <GlassCard className="mt-6" style={{ marginTop: '24px' }}>
            <div className={styles.cardHeader} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <User className={styles.cardHeaderIcon} style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-gold)' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--foreground-primary)' }}>Security & Payout Status</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className={styles.profileRow} style={{ borderBottom: 'none' }}>
                <span style={{ color: 'var(--foreground-muted)' }}>Username:</span>
                <strong style={{ display: 'block', marginTop: '4px', fontSize: '1.125rem' }}>{profile?.username ? profile.username : (user?.email ? user.email.split("@")[0] : "Not set")}</strong>
              </div>
              
              <div className={styles.profileRow} style={{ borderBottom: 'none' }}>
                <span style={{ color: 'var(--foreground-muted)' }}>Phone Verification:</span>
                <div style={{ marginTop: '4px' }}>
                  {profile?.phone_verified ? (
                    <span className={styles.statusSuccess} style={{ color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Phone Verified
                    </span>
                  ) : (
                    <span className={styles.statusDanger} style={{ color: 'var(--status-error)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert size={16} /> Unverified
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.profileRow} style={{ borderBottom: 'none' }}>
                <span style={{ color: 'var(--foreground-muted)' }}>Payout Verification:</span>
                <div style={{ marginTop: '4px' }}>
                  {profile?.identity_status === "verified" ? (
                    <span className="badge badge-success" style={{ backgroundColor: 'rgba(18, 183, 106, 0.1)', color: 'var(--accent-green)', border: '1px solid var(--border-green)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Verified</span>
                  ) : profile?.identity_status === "pending" ? (
                    <span className="badge badge-warning" style={{ backgroundColor: 'rgba(214, 162, 58, 0.1)', color: 'var(--accent-gold)', border: '1px solid var(--border-gold)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Pending Review</span>
                  ) : profile?.identity_status === "under_review" ? (
                    <span className="badge badge-warning" style={{ backgroundColor: 'rgba(214, 162, 58, 0.1)', color: 'var(--accent-gold)', border: '1px solid var(--border-gold)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Under Review</span>
                  ) : profile?.identity_status === "rejected" ? (
                    <span className="badge badge-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', border: '1px solid var(--status-error)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Rejected</span>
                  ) : (
                    <span className="badge badge-info" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', border: '1px solid var(--border-cyan)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Unverified</span>
                  )}
                </div>
              </div>
            </div>

            {profile?.bank_account_flagged && (
              <div className={styles.flaggedNotice} style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-error)' }}>
                <ShieldAlert size={16} />
                <span>Bank account flagged. Duplicate detected.</span>
              </div>
            )}

            <div className={styles.profileCta} style={{ marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <Link href="/settings" className="btn-glass" style={{ display: 'inline-flex' }}>
                Manage Verification
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>
    </>
  );
}
