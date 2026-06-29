// src/app/(dashboard)/arena/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import Button from "@/components/ui/button";
import { Lock, HelpCircle, ShieldAlert, CheckCircle, Trophy, Sparkles, Zap } from "lucide-react";
import styles from "./page.module.css";

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
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadArena() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

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
    }
    loadArena();
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
        <div className="container-center" style={{ flex: 1 }}>
          <div className="font-data">LOADING PLAY ARENA...</div>
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
            <div className={styles.headerContent}>
              <Trophy className={styles.trophyIcon} />
              <div>
                <h1 className={styles.title}>Play Arena</h1>
                <p className={styles.subtitle}>
                  Predict outcomes for the 3 matches this round. Complete the streak to qualify for the round reward.
                </p>
              </div>
            </div>
            
            {activeRound && (
              <div className={styles.roundInfo}>
                <span className={styles.roundBadge}>Round #{activeRound.round_number}</span>
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
                <Zap className={styles.enrollIcon} />
                <h2>Enroll in Round #{activeRound.round_number}</h2>
                <p>Select your challenge tier using your wallet balance. Complete the round streak to qualify for the listed reward after review.</p>
              </div>

              <div className={styles.tiersGrid}>
                {tiers.map((tier) => (
                  <GlassCard key={tier.id} className={styles.tierCard} hoverEffect={true}>
                    <h3 className={styles.tierName}>{tier.name}</h3>
                    <div className={styles.tierPrice}>NGN {tier.price_ngn.toLocaleString()}</div>
                    <div className={styles.tierReward}>
                      Listed Reward: <strong>{cleanReward(tier.perks?.reward)}</strong>
                    </div>
                    <Button
                      onClick={() => handleEnroll(tier.id, tier.price_ngn)}
                      variant="premium"
                      loading={actionLoading}
                      className={styles.enrollBtn}
                    >
                      Enroll Now
                    </Button>
                  </GlassCard>
                ))}
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
