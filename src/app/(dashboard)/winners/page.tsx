// src/app/(dashboard)/winners/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { Award, ShieldCheck, Trophy } from "lucide-react";
import styles from "./page.module.css";

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
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <Award className={styles.awardIcon} />
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
                <Trophy className={styles.noWinnersIcon} />
                <h3>No Verified Winners Yet</h3>
                <p>Be the first to complete a 3-match prediction streak and claim the pool reward!</p>
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
                            ₦{winner.payout_amount.toLocaleString()}
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
