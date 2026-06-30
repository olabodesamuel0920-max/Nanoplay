// src/app/(dashboard)/winners/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { ShieldCheck } from "lucide-react";
import styles from "./page.module.css";
import AtmosphereLayer from "@/components/AtmosphereLayer";

export default function WinnersPage() {
  const supabase = createClient();
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWinners() {
      // Query only verified winners for the public list
      const { data } = await supabase
        .from("winners")
        .select(`
          id,
          payout_amount,
          created_at,
          profile:user_id (
            username
          ),
          round:round_id (
            round_number
          )
        `)
        .eq("verified", true)
        .order("created_at", { ascending: false });

      setWinners(data || []);
      setLoading(false);
    }
    fetchWinners();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-center" style={{ flex: 1 }}>
          <div className="font-data">LOADING CHAMPIONS...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <AtmosphereLayer variant="winners" />

        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.badgeWrapper}>
                <span className={styles.footballBadge} aria-hidden="true" />
              </div>
              <div>
                <h1 className={styles.title}>Hall of Champions</h1>
                <p className={styles.subtitle}>
                  Public leaderboard of verified challenge winners with complete wallet payout confirmations.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.winnersSection}>
            {winners.length === 0 ? (
              <GlassCard className={styles.noWinnersCard}>
                <span className={styles.trophySpotlight} aria-hidden="true" />
                <h3>No Verified Winners Yet</h3>
                <p>Verified winners will appear here after the first challenge round is reviewed.</p>
                <div className={styles.podium}>
                  <div className={`${styles.podiumStep} ${styles.step2}`}>
                    <span className={styles.podiumRank}>2</span>
                  </div>
                  <div className={`${styles.podiumStep} ${styles.step1}`}>
                    <span className={styles.podiumBadge} aria-hidden="true" />
                    <span className={styles.podiumRank}>1</span>
                  </div>
                  <div className={`${styles.podiumStep} ${styles.step3}`}>
                    <span className={styles.podiumRank}>3</span>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className={styles.tableCard} hoverEffect={false}>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Round</th>
                        <th>Winner Username</th>
                        <th>Payout Confirmed</th>
                        <th>Winner Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {winners.map((winner) => (
                        <tr key={winner.id}>
                          <td className={styles.tdRound}>
                            Round #{winner.round?.round_number || "N/A"}
                          </td>
                          <td className={styles.tdUsername}>
                            {winner.profile?.username || "Anonymous Player"}
                          </td>
                          <td className={[styles.tdAmount, "font-data"].join(" ")}>
                             NGN {winner.payout_amount.toLocaleString()}
                          </td>
                          <td>
                            <span className={styles.verificationStatus}>
                              <ShieldCheck size={16} />
                              <span>Payout Verified</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
