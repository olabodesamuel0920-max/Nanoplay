// src/app/(dashboard)/referrals/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { Users, Copy, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";
import styles from "./page.module.css";

export default function ReferralsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadReferrals() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Fetch referrals
      const { data: referralsData } = await supabase
        .from("referrals")
        .select(`
          id,
          status,
          created_at,
          referred:referred_user_id (
            username,
            phone_verified,
            identity_status
          )
        `)
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      setReferrals(referralsData || []);
      setLoading(false);
    }
    loadReferrals();
  }, []);

  if (!supabase) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--foreground-muted)" }}>
        <p style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--foreground-primary)" }}>
          Platform services are temporarily unavailable.
        </p>
        <p>Please check your connection or try again later.</p>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (!profile) return;
    const referralCode = profile.username;
    // Use the site URL or default domain
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-center" style={{ flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <div
              className="animate-spin rounded-full"
              style={{ width: "32px", height: "32px", border: "2px solid #D4A853", borderTopColor: "transparent" }}
              role="status"
              aria-label="Loading"
            />
            <div className="font-data" style={{ fontSize: "12px", color: "#94a3b8" }}>Loading referral network</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Referrals</h1>
            <p className={styles.subtitle}>
              Invite your friends to predict and earn rewards. Earn NGN 1,000 for each qualified referral.
            </p>
          </div>

          <div className={styles.grid}>
            {/* Left Column: Link Share */}
            <div className={styles.leftColumn}>
              <GlassCard className={styles.card} accent={true}>
                <div className={styles.cardHeader}>
                  <Sparkles className={styles.cardHeaderIcon} />
                  <h3>Your Referral Code</h3>
                </div>
                <p className={styles.cardDesc}>
                  Share your link. When a friend signs up, verifies their phone OTP, enters a challenge round, and places predictions, you both win.
                </p>

                <div className={styles.codeContainer}>
                  <span className={[styles.referralCode, "font-data"].join(" ")}>
                    {profile?.username}
                  </span>
                  <button onClick={handleCopyLink} className={styles.copyBtn}>
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    <span>{copied ? "Copied" : "Copy Link"}</span>
                  </button>
                </div>

                <div className={styles.conditionsBox}>
                  <h4 className={styles.conditionsTitle}>Qualification Criteria</h4>
                  <ul className={styles.conditionsList}>
                    <li>Friend must sign up using your referral username.</li>
                    <li>Friend must verify their phone number via OTP.</li>
                    <li>Friend must enroll in a challenge round (Starter, Standard, or Premium).</li>
                    <li>Friend must submit predictions for the matches.</li>
                  </ul>
                </div>
              </GlassCard>
            </div>

            {/* Right Column: Referrals List */}
            <div className={styles.rightColumn}>
              <GlassCard className={styles.card}>
                <div className={styles.cardHeader}>
                  <Users className={styles.cardHeaderIcon} />
                  <h3>Active Network ({referrals.length})</h3>
                </div>

                {referrals.length === 0 ? (
                  <div className={styles.noReferrals}>
                    No referrals found yet. Share your code to build your network!
                  </div>
                ) : (
                  <div className={styles.referralList}>
                    {referrals.map((ref) => {
                      const refUserObj = Array.isArray(ref.referred) ? ref.referred[0] : ref.referred;
                      const refUsername = refUserObj?.username || "Player";
                      const isVerified = refUserObj?.phone_verified;
                      const isQualified = ref.status === "qualified";
                      const isFlagged = ref.status === "flagged";

                      return (
                        <div key={ref.id} className={styles.referralItem}>
                          <div className={styles.referralInfo}>
                            <span className={styles.username}>{refUsername}</span>
                            <span className={styles.date}>
                              Joined {new Date(ref.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className={styles.referralState}>
                            {isFlagged ? (
                              <span className="badge badge-error">Flagged (Self-Referral)</span>
                            ) : isQualified ? (
                               <span className="badge badge-success">Qualified (NGN 1,000 Credited)</span>
                            ) : (
                              <span className="badge badge-warning">Pending Predictions</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
