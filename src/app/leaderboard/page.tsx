// src/app/leaderboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { createClient } from "@/lib/supabase/client";
import { Trophy, ShieldCheck, Award } from "lucide-react";
import styles from "./page.module.css";

export default function LeaderboardPage() {
  const supabase = createClient();
  const [realWinners, setRealWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data } = await supabase
          .from("winners")
          .select(`
            id,
            payout_amount,
            created_at,
            profile:user_id (
              username
            )
          `)
          .eq("verified", true)
          .order("payout_amount", { ascending: false })
          .limit(10);
        if (data && data.length > 0) {
          setRealWinners(data);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  // Demo-safe fallbacks if no real verified winners exist
  const demoWinners = [
    { rank: 1, username: "arena_king", reward: 250000, streaks: 5, verified: true },
    { rank: 2, username: "pitch_master", reward: 150000, streaks: 3, verified: true },
    { rank: 3, username: "streak_pro", reward: 100000, streaks: 2, verified: true },
    { rank: 4, username: "football_oracle", reward: 50000, streaks: 1, verified: true },
    { rank: 5, username: "pred_champion", reward: 50000, streaks: 1, verified: true },
  ];

  const hasRealData = realWinners.length > 0;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Trophy size={40} className={styles.icon} />
            <h1 className={styles.title}>Leaderboard & Rankings</h1>
            <p className={styles.subtitle}>Verified champion outcomes and streak counts across tiers.</p>
          </div>

          <GlassCard className={styles.tableCard} hoverEffect={false}>
            <div className={styles.tableHeader}>
              <div className={styles.colRank}>Rank</div>
              <div className={styles.colUser}>User</div>
              <div className={styles.colReward}>Total Reward</div>
              <div className={styles.colStreaks}>Streaks Won</div>
              <div className={styles.colStatus}>Status</div>
            </div>

            <div className={styles.tableBody}>
              {loading ? (
                <div className={styles.loading} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                  <div
                    className="animate-spin rounded-full"
                    style={{ width: "32px", height: "32px", border: "2px solid #D4A853", borderTopColor: "transparent" }}
                    role="status"
                    aria-label="Loading"
                  />
                  <span>Loading leaderboard</span>
                </div>
              ) : hasRealData ? (
                realWinners.map((w, index) => (
                  <div key={w.id} className={styles.tableRow}>
                    <div className={styles.colRank}>
                      <span className={styles.rankBadge}>#{index + 1}</span>
                    </div>
                    <div className={styles.colUser}>{w.profile?.username}</div>
                    <div className={[styles.colReward, "font-data"].join(" ")}>NGN {w.payout_amount.toLocaleString()}</div>
                    <div className={styles.colStreaks}>1</div>
                    <div className={styles.colStatus}>
                      <span className={styles.verifiedBadge}>
                        <ShieldCheck size={12} />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                demoWinners.map((w) => (
                  <div key={w.rank} className={styles.tableRow}>
                    <div className={styles.colRank}>
                      <span className={[styles.rankBadge, styles[`rank${w.rank}`]].join(" ")}>#{w.rank}</span>
                    </div>
                    <div className={styles.colUser}>{w.username}</div>
                    <div className={[styles.colReward, "font-data"].join(" ")}>NGN {w.reward.toLocaleString()}</div>
                    <div className={styles.colStreaks}>{w.streaks}</div>
                    <div className={styles.colStatus}>
                      <span className={styles.verifiedBadge}>
                        <ShieldCheck size={12} />
                        <span>Verified Demo</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </main>
    </>
  );
}
