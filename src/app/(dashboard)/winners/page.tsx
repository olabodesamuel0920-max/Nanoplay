// src/app/(dashboard)/winners/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { ShieldCheck } from "lucide-react";
import { SkeletonTable } from "@/components/SkeletonLoader";
import styles from "./page.module.css";
import AtmosphereLayer from "@/components/AtmosphereLayer";

export default function WinnersPage() {
  const supabase = createClient();
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);

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
      clearTimeout(timer);
    }
    fetchWinners();
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={`${styles.main} main-with-bottom-nav relative`}>
          {/* Mobile atmosphere — lightweight CSS only */}
          <div className="mobile-atmosphere md:hidden" aria-hidden="true" />
          <div className="mobile-pitch-floor md:hidden" aria-hidden="true" />
          
          <AtmosphereLayer variant="winners" />
          <div className={styles.container}>
            <div className={styles.header} style={{ marginBottom: "2rem" }}>
              <h1 className={styles.title}>Hall of Champions</h1>
              <p className={styles.subtitle}>Loading winners leaderboard...</p>
            </div>
            <SkeletonTable rows={5} />
            {showTimeout && (
              <div className="text-center py-4" style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <p className="text-xs text-slate-400 mb-2">Taking longer than expected. Check your connection or refresh.</p>
                <button onClick={() => window.location.reload()} className="btn-premium" style={{ display: "inline-flex", padding: "0.5rem 1rem", minHeight: "44px" }}>
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={`${styles.main} main-with-bottom-nav relative`}>
        {/* Mobile atmosphere — lightweight CSS only */}
        <div className="mobile-atmosphere md:hidden" aria-hidden="true" />
        <div className="mobile-pitch-floor md:hidden" aria-hidden="true" />
        
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
                {/* Desktop table — keep existing, wrap in hidden md:block */}
                <div className="hidden md:block" style={{ width: '100%' }}>
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
                </div>

                {/* Mobile winners list (< 768px) */}
                <div className="md:hidden space-y-3" style={{ width: '100%' }}>
                  {winners.map((winner, i) => (
                    <div key={winner.id} className="glass-card p-4 rounded-xl flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', marginBottom: '12px' }}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                        ${
                          i === 0
                            ? "bg-yellow-500/20 text-yellow-400"
                            : i === 1
                            ? "bg-slate-300/20 text-slate-300"
                            : i === 2
                            ? "bg-amber-600/20 text-amber-500"
                            : "bg-[#1a1a1a] text-slate-400"
                        }`}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-sm font-medium text-white truncate" style={{ fontWeight: '500', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{winner.profile?.username || "Anonymous Player"}</p>
                        <p className="text-xs text-slate-400" style={{ fontSize: '12px', color: '#94a3b8' }}>Round #{winner.round?.round_number || "N/A"}</p>
                      </div>
                      <div className="text-right shrink-0" style={{ textAlign: 'right' }}>
                        <p className="text-sm font-bold text-[#D4A853] font-mono" style={{ fontWeight: 'bold', color: '#D4A853' }}>
                          ₦{winner.payout_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-400" style={{ fontSize: '12px', color: 'var(--accent-green)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={12} /> Verified
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
