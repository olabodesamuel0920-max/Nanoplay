// src/app/(dashboard)/arena/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import Button from "@/components/ui/button";
import { getOrCreateProfile } from "@/app/actions/verification";
import { Lock, HelpCircle, ShieldAlert, CheckCircle, Sparkles, Zap, Wallet, Clock, Info, Calendar } from "lucide-react";
import styles from "./page.module.css";
import AtmosphereLayer from "@/components/AtmosphereLayer";

const cleanReward = (rewardStr: string) => {
  if (!rewardStr) return "";
  if (rewardStr.startsWith("NGN")) return rewardStr;
  return rewardStr.replace(/[₦N]/g, "NGN ").replace(/\s+/g, " ").trim();
};

export default function ArenaPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  
  // Challenge State
  const [activeRound, setActiveRound] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [entry, setEntry] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  
  // Selection/Submission States
  const [predictions, setPredictions] = useState<{ [matchId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [showTimeout, setShowTimeout] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);

    async function loadArena() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Fetch Profile
      const res = await getOrCreateProfile();
      let profileData = null;
      if (res.ok && res.profile) {
        profileData = res.profile;
        setProfile(profileData);
      }

      // Fetch Wallet
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setWallet(walletData);

      // Fetch Tiers
      const { data: tiersData } = await supabase
        .from("account_tiers")
        .select("*")
        .eq("is_active", true);
      setTiers(tiersData || []);

      // Fetch Active Round
      const { data: roundData } = await supabase
        .from("challenge_rounds")
        .select("*")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (roundData) {
        setActiveRound(roundData);

        // Fetch Matches in Round
        const { data: matchesData } = await supabase
          .from("challenge_matches")
          .select("*")
          .eq("round_id", roundData.id)
          .order("matchday", { ascending: true });
        setMatches(matchesData || []);

        // Fetch User's Entry for Active Round
        const { data: entryData } = await supabase
          .from("challenge_entries")
          .select("*")
          .eq("user_id", user.id)
          .eq("round_id", roundData.id)
          .maybeSingle();

        if (entryData) {
          setEntry(entryData);

          // Fetch existing predictions for this entry
          const { data: predictionsData } = await supabase
            .from("predictions")
            .select("*")
            .eq("entry_id", entryData.id);

          if (predictionsData) {
            const preds: { [matchId: string]: string } = {};
            predictionsData.forEach((p: any) => {
              preds[p.match_id] = p.prediction;
            });
            setPredictions(preds);
          }
        }
      } else {
        // If no active round exists, we can mock/simulate one or show "No active round"
        // Let's create an upcoming/placeholder status if database is blank.
      }
      setLoading(false);
      clearTimeout(timer);
    }
    loadArena();
    return () => clearTimeout(timer);
  }, []);

  const handleEnroll = async (tierId: string, price: number) => {
    if (!activeRound) return;
    
    // Check if phone number is verified first
    if (!profile?.phone_verified) {
      setMessage({
        type: "error",
        text: "Verify your phone number before enrolling in this round.",
      });
      return;
    }
    
    setActionLoading(true);
    setMessage(null);

    // Validate balance before proceeding
    if ((wallet?.balance_ngn || 0) < price) {
      setMessage({
        type: "error",
        text: `Insufficient balance. Please deposit at least NGN ${(price - wallet.balance_ngn).toLocaleString()} to enroll.`,
      });
      setActionLoading(false);
      return;
    }

    try {
      // Call atomic database function to purchase tier and auto-enroll
      const { error } = await supabase.rpc("purchase_tier_with_wallet_atomic", {
        p_user_id: user.id,
        p_tier_id: tierId,
        p_payment_reference: "arena_purchase_" + Math.random().toString(36).substr(2, 9),
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        setActionLoading(false);
        return;
      }

      // Reload state
      const { data: entryData } = await supabase
        .from("challenge_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("round_id", activeRound.id)
        .maybeSingle();
      
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setEntry(entryData);
      setWallet(walletData);
      setMessage({ type: "success", text: "Successfully enrolled in play arena!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Enrollment failed." });
    }
    setActionLoading(false);
  };

  const handleSelectPrediction = (matchId: string, value: string, isLocked: boolean) => {
    if (isLocked) return;
    setPredictions((prev) => ({
      ...prev,
      [matchId]: value,
    }));
  };

  const handleSubmitPredictions = async () => {
    if (!entry) return;
    
    // Check if phone number is verified first
    if (!profile?.phone_verified) {
      setMessage({
        type: "error",
        text: "Submission Blocked: Please verify your phone number via OTP in Settings first.",
      });
      return;
    }

    // Must predict all matches
    if (Object.keys(predictions).length < matches.length) {
      setMessage({
        type: "error",
        text: "Please submit predictions for all matches in the round.",
      });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      // Insert predictions one by one or in a batch
      const predictionInserts = Object.keys(predictions).map((matchId) => ({
        entry_id: entry.id,
        match_id: matchId,
        prediction: predictions[matchId],
        is_locked: false,
      }));

      // Upsert to handle updates
      const { error } = await supabase
        .from("predictions")
        .upsert(predictionInserts, { onConflict: "entry_id,match_id" });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Predictions successfully submitted!" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to submit predictions." });
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="skeleton-box" style={{ height: '3rem', width: '30%', marginBottom: '2rem' }}></div>
            
            {/* Tiers Grid skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="skeleton-box" style={{ height: '24rem' }}></div>
              <div className="skeleton-box" style={{ height: '24rem' }}></div>
              <div className="skeleton-box" style={{ height: '24rem' }}></div>
            </div>

            {showTimeout && (
              <div className="text-center py-4" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p className="text-sm mb-2" style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Taking longer than expected to load play arena...</p>
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
        <AtmosphereLayer variant="arena" />
        
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.badgeWrapper}>
                <span className={styles.footballBadge} aria-hidden="true" />
              </div>
              <div>
                <h1 className={styles.title}>Play Arena</h1>
                <p className={styles.subtitle}>
                  Predict outcomes for the 3 matches this round. Complete the streak to qualify for the round reward.
                </p>
              </div>
            </div>
            
            {activeRound && (
              <div className={styles.roundInfo}>
                <span className={styles.roundBadge}>
                  <span className={styles.statusOrb} aria-hidden="true" />
                  Round #{activeRound.round_number}
                </span>
                <span className={styles.roundDates}>
                  Ends {new Date(activeRound.end_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {message && (
            <div className={message.type === "success" ? styles.successAlert : styles.errorAlert}>
              {message.text}
            </div>
          )}

          {!profile?.phone_verified && (
            <div className={styles.verificationBanner}>
              <ShieldAlert className={styles.bannerIcon} />
              <div className={styles.bannerText}>
                <strong>Phone Verification Required:</strong> Phone verification protects referrals and prevents duplicate accounts.
              </div>
              <Button onClick={() => router.push("/settings")} variant="glass" className={styles.bannerBtn}>
                Verify Now
              </Button>
            </div>
          )}

          {/* Core Arena Content */}
          {!activeRound ? (
            <GlassCard className={styles.noRoundCard}>
              <Sparkles className={styles.noRoundIcon} />
              <h3>Next Matchday Opens Soon</h3>
              <p>New prediction rounds are being prepared. Check back shortly or follow the launch update.</p>
            </GlassCard>
          ) : !entry ? (
            /* Enrollment View */
            <div className={styles.enrollSection}>
              <div className={styles.enrollHeader}>
                <div className={styles.matchdayBanner}>
                  <span className={styles.matchdayBadge}>
                    <span className={styles.bannerPulse} />
                    MATCHDAY LIVE
                  </span>
                  <h2>Round #{activeRound.round_number} Challenge Board</h2>
                </div>
                <p className={styles.enrollDescription}>
                  Choose your challenge pass to enter the arena. Predict match outcomes, build your win streak, and claim the listed reward after verified review.
                </p>
                <div className={styles.sportsPitchAtmosphere}>
                  <div className={styles.soccerField}></div>
                </div>
              </div>

              {/* Arena Lobby Navigation Tabs */}
              <div className={styles.arenaTabs} aria-label="Arena Lobby filters">
                <button className={[styles.arenaTab, styles.arenaTabActive].join(" ")}>
                  <span>Active Predictions</span>
                  <span className={styles.tabBadge}>1</span>
                </button>
                <button className={styles.arenaTab}>
                  <span>Upcoming Rounds</span>
                  <span className={styles.tabBadge}>3</span>
                </button>
                <button className={styles.arenaTab}>
                  <span>Completed / Results</span>
                </button>
              </div>

              {/* Arena Lobby Metadata: Wallet & Quick Rules */}
              <div className={styles.lobbyMetaRow}>
                {/* Compact Wallet Balance card */}
                <div className={styles.lobbyWalletCard}>
                  <div className={styles.lobbyWalletLabel}>
                    <Wallet size={13} />
                    <span>Your Balance</span>
                  </div>
                  <div className={styles.lobbyWalletValue}>
                    NGN {(wallet?.balance_ngn || 0).toLocaleString()}
                  </div>
                </div>

                {/* Quick Rules strip */}
                <div className={styles.lobbyRulesStrip}>
                  <div className={styles.rulesItem}>
                    <span className={styles.rulesDot}>⚽</span>
                    <span>3 picks per round</span>
                  </div>
                  <div className={styles.rulesItem}>
                    <span className={styles.rulesDot}>🔒</span>
                    <span>Locks at kickoff</span>
                  </div>
                  <div className={styles.rulesItem}>
                    <span className={styles.rulesDot}>📱</span>
                    <span>Phone verified required</span>
                  </div>
                </div>
              </div>

              {/* Challenge Explanation Banner (PART 2 - 5) */}
              <div className="mb-4 p-4 rounded-xl relative z-10" style={{ backgroundColor: 'var(--bg-charcoal)', border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>This Matchday&apos;s Challenge</h3>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
                  Predict the outcome of 5 selected matches. Get all 5 correct to win the maximum reward. 
                  Partial correct predictions earn proportional points. Streak bonuses apply.
                </p>
              </div>

              {/* Trust Disclaimer Banner (PART 9) */}
              <div className="mb-8 py-3 px-4 border rounded-xl relative z-10" style={{ border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-charcoal)', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
                <p className="text-center text-xs" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
                  NanoPlay is a football prediction challenge platform. Not betting. Not gambling. 
                  Predictions are for entertainment. Rewards are subject to manual review and verification.
                </p>
              </div>

              <div className={styles.tiersGrid}>
                {tiers.map((tier) => {
                  const isStarter = tier.name.toLowerCase().includes("starter") || tier.name.toLowerCase().includes("lite") || tier.price_ngn === 200;
                  const isStandard = tier.name.toLowerCase().includes("standard") || tier.name.toLowerCase().includes("main") || tier.price_ngn === 500;
                  const isPremium = tier.name.toLowerCase().includes("premium") || tier.name.toLowerCase().includes("pro") || tier.price_ngn === 1000;
                  
                  // Map titles and values exactly as requested
                  let displayName = tier.name;
                  let rewardValue = cleanReward(tier.perks?.reward || "");
                  if (tier.price_ngn === 200) {
                    displayName = "Starter";
                    rewardValue = "₦600";
                  } else if (tier.price_ngn === 500) {
                    displayName = "Main Event";
                    rewardValue = "₦1,500";
                  } else if (tier.price_ngn === 1000) {
                    displayName = "High Stakes";
                    rewardValue = "₦3,000";
                  }

                  const passLabel = isStarter ? "ENTRY PASS" : isPremium ? "ELITE PASS" : "CHALLENGE PASS";
                  const tierClass = isStarter ? styles.starter : isPremium ? styles.premium : styles.standard;

                  return (
                    <GlassCard
                      key={tier.id}
                      className={[styles.tierCard, tierClass, isStandard ? styles.highlighted : ""].join(" ")}
                      hoverEffect={!isStandard}
                    >
                      {/* Decorative/Atmosphere elements in the ticket card */}
                      {isStandard && <div className={styles.standardGlow} aria-hidden="true" style={{ boxShadow: 'var(--shadow-gold)', border: '1px solid var(--border-gold)' }} />}
                      <span className={styles.cardWatermark} aria-hidden="true" />
                      <span className={styles.cardTexture} aria-hidden="true" />
                      <div className={styles.ticketNotchLeft} aria-hidden="true" />
                      <div className={styles.ticketNotchRight} aria-hidden="true" />

                      {isStandard && (
                        <div className={styles.recommendedBadge}>
                          MOST POPULAR
                        </div>
                      )}

                      <div className={styles.ticketMain}>
                        <div className={styles.cardHeader}>
                          <span className={styles.passLabel}>{passLabel}</span>
                          <span className={styles.roundChip}>
                            <span className={styles.statusOrb} aria-hidden="true" />
                            Round #{activeRound.round_number}
                          </span>
                        </div>

                        <h3 className={styles.tierTitle}>{displayName}</h3>

                        <div className={styles.priceContainer}>
                          <span className={styles.priceLabel} style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>STAKE</span>
                          <span className={[styles.priceValue, "font-mono-numbers"].join(" ")}>₦ {tier.price_ngn.toLocaleString()}</span>
                        </div>

                        <div className={styles.rewardContainer}>
                          <span className={styles.rewardLabel} style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>REWARD</span>
                          <div className={styles.rewardStrip}>
                            <span className={styles.rewardIcon} aria-hidden="true" />
                            <span className={[styles.rewardValue, "font-mono-numbers"].join(" ")} style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', fontWeight: 'bold' }}>{rewardValue}</span>
                          </div>
                        </div>

                        <div className={styles.detailsList}>
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon} aria-hidden="true">✓</span>
                            <span>Streak target: 3 wins</span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon} aria-hidden="true">✓</span>
                            <span>Review required</span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon} aria-hidden="true">✓</span>
                            <span>Phone verified only</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.ticketDivider} aria-hidden="true" />

                      <div className={styles.ticketFooter}>
                        <Button
                          onClick={() => handleEnroll(tier.id, tier.price_ngn)}
                          variant="premium"
                          loading={actionLoading}
                          className={styles.enrollBtn}
                        >
                          Enter This Challenge
                        </Button>
                        <p className="text-center text-slate-400 mt-2 font-mono-numbers" style={{ fontSize: '10px', marginTop: '0.5rem', color: 'var(--foreground-muted)' }}>
                          ₦{tier.price_ngn.toLocaleString()} deducted from wallet. Win {rewardValue} if all predictions correct.
                        </p>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              {/* Urgency & Countdown Banner (PART 2 - 3) */}
              <div className="mt-8 text-center relative z-10" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: 'var(--bg-charcoal)', border: '1px solid var(--border-gold)', borderRadius: '9999px', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock className="w-4 h-4" style={{ color: 'var(--accent-gold)', width: '1rem', height: '1rem' }} />
                  <span className="text-sm text-white">Next matchday starts in 2d 14h 32m</span>
                </div>
                <p className="text-sm text-slate-400 mt-2" style={{ color: 'var(--foreground-muted)', marginTop: '0.5rem' }}>47 of 200 spots filled</p>
              </div>
            </div>
          ) : (
            /* Matches / Prediction Form View */
            <div className={styles.arenaGrid}>
              <div className={styles.matchesColumn}>
                <div className={styles.sectionTitle}>Today&apos;s Challenge</div>
                <div className={styles.matchesList}>
                  {matches.map((match, index) => {
                    const isLocked = new Date(match.kickoff_time) < new Date();
                    const selected = predictions[match.id];

                    return (
                      <GlassCard key={match.id} className={styles.matchCard} hoverEffect={false}>
                        <div className={styles.matchHeader}>
                          <span className={styles.matchday}>Matchday {match.matchday}</span>
                          <span className={styles.kickoff}>
                            Kickoff: {new Date(match.kickoff_time).toLocaleString()}
                          </span>
                        </div>

                        <div className={styles.matchTeams}>
                          <div className={styles.teamName}>{match.home_team}</div>
                          <div className={styles.vs}>VS</div>
                          <div className={styles.teamName}>{match.away_team}</div>
                        </div>

                        {isLocked ? (
                          <div className={styles.lockedRow}>
                            <Lock size={14} />
                            <span>Locked: Match has already kicked off.</span>
                            {selected && (
                              <span className={styles.lockedChoice}>
                                Your prediction: <strong>{selected === "1" ? "Home Win" : selected === "2" ? "Away Win" : "Draw"}</strong>
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className={styles.predictionOptions}>
                            <button
                              className={[
                                styles.predOption,
                                selected === "1" ? styles.selected : ""
                              ].join(" ")}
                              onClick={() => handleSelectPrediction(match.id, "1", isLocked)}
                            >
                              <span>1 {selected === "1" && "✓"}</span>
                              <span className={styles.optionLabel}>Home Win</span>
                            </button>
                            <button
                              className={[
                                styles.predOption,
                                selected === "X" ? styles.selected : ""
                              ].join(" ")}
                              onClick={() => handleSelectPrediction(match.id, "X", isLocked)}
                            >
                              <span>X {selected === "X" && "✓"}</span>
                              <span className={styles.optionLabel}>Draw</span>
                            </button>
                            <button
                              className={[
                                styles.predOption,
                                selected === "2" ? styles.selected : ""
                              ].join(" ")}
                              onClick={() => handleSelectPrediction(match.id, "2", isLocked)}
                            >
                              <span>2 {selected === "2" && "✓"}</span>
                              <span className={styles.optionLabel}>Away Win</span>
                            </button>
                          </div>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>

                <div className={styles.submitRow}>
                  <Button
                    onClick={handleSubmitPredictions}
                    variant="premium"
                    loading={actionLoading}
                    disabled={!profile?.phone_verified}
                    className={styles.submitBtn}
                  >
                    Submit Arena Predictions
                  </Button>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className={styles.sidebarColumn}>
                <GlassCard className={styles.rulesCard}>
                  <h3 className={styles.rulesTitle}>Matchday Rules</h3>
                  <ul className={styles.rulesList}>
                    <li>Select one outcome (1, X, 2) for all 3 matches.</li>
                    <li>Predictions are automatically locked at kickoff of each match.</li>
                    <li>If you predict all 3 matches correctly, you complete the streak.</li>
                    <li>Round winner entries are sent to the Admin Review Queue for safety audits before wallets are credited.</li>
                  </ul>
                </GlassCard>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
