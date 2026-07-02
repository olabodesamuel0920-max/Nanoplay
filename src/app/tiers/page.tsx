// src/app/tiers/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Check, Info } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonLoader";
import styles from "./page.module.css";
import AtmosphereLayer from "@/components/AtmosphereLayer";

export default function TiersPage() {
  const supabase = createClient();
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);

    async function fetchTiers() {
      try {
        const { data } = await supabase
          .from("account_tiers")
          .select("*")
          .eq("is_active", true)
          .order("price_ngn", { ascending: true });
        if (data) {
          setTiers(data);
        }
      } catch (err) {
        console.error("Error fetching tiers:", err);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    }
    fetchTiers();
    return () => clearTimeout(timer);
  }, []);

  const fallbackTiers = [
    { name: "Starter Challenge", price_ngn: 5000, perks: { reward: "NGN 50,000 potential reward", predictions_per_round: 3, referral_bonus: 1000 } },
    { name: "Main Event", price_ngn: 10000, perks: { reward: "NGN 100,000 potential reward", predictions_per_round: 3, referral_bonus: 1000, priority: true } },
    { name: "Premium Challenge", price_ngn: 20000, perks: { reward: "NGN 200,000 potential reward", predictions_per_round: 3, referral_bonus: 1000, priority: true, elite_badge: true } }
  ];

  const getTierDisplayName = (name: string) => {
    if (name === "Starter") return "Starter Challenge";
    if (name === "Standard" || name === "Main Event") return "Main Event";
    if (name === "Premium" || name === "High Stakes") return "Premium Challenge";
    return name;
  };

  const displayTiers = tiers.length > 0 ? tiers : fallbackTiers;

  return (
    <>
      <Navbar />
      <main className={`${styles.main} main-with-bottom-nav relative`}>
        {/* Mobile atmosphere — lightweight CSS only */}
        <div className="mobile-atmosphere md:hidden" aria-hidden="true" />
        <div className="mobile-pitch-floor md:hidden" aria-hidden="true" />
        
        <AtmosphereLayer variant="tiers" />
        <div className={styles.container}>
          <div className={styles.header}>
            <AwardBadge size={40} className={styles.icon} />
            <h1 className={styles.title}>Challenge Tiers</h1>
            <p className={styles.subtitle}>Select a tier to begin. Complete your 3-match prediction streak to qualify for the round reward.</p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              {showTimeout && (
                <div className="text-center py-4" style={{ textAlign: "center", marginTop: "1rem" }}>
                  <p className="text-sm text-slate-400 mb-2">Taking longer than expected. Check your connection or refresh.</p>
                  <button onClick={() => window.location.reload()} className="btn-premium" style={{ display: "inline-flex", padding: "0.5rem 1rem" }}>
                    Refresh Page
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {displayTiers.map((tier) => {
                const displayName = getTierDisplayName(tier.name);
                return (
                  <GlassCard key={tier.name} className={styles.card} accent={displayName !== "Starter Challenge"} hoverEffect={true}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.tierName}>{displayName}</h3>
                      <div className={styles.priceRow}>
                        <span className={[styles.price, "font-data"].join(" ")}>NGN {tier.price_ngn.toLocaleString()}</span>
                        <span className={styles.period}>/ entry amount</span>
                      </div>
                    </div>

                    <ul className={styles.perksList}>
                      <li className={styles.perkItem}>
                        <Check size={14} className={styles.checkIcon} />
                        <span>Potential reward: <strong>{tier.perks?.reward || `NGN ${(tier.price_ngn * 10).toLocaleString()}`}</strong></span>
                      </li>
                      <li className={styles.perkItem}>
                        <Check size={14} className={styles.checkIcon} />
                        <span>Round limit: 3 predictions per kickoff cycle</span>
                      </li>
                      <li className={styles.perkItem}>
                        <Check size={14} className={styles.checkIcon} />
                        <span>Secure reward tracking</span>
                      </li>
                      {tier.perks?.priority && (
                        <li className={styles.perkItem}>
                          <Check size={14} className={styles.checkIcon} />
                          <span>Priority manual winner review queue</span>
                        </li>
                      )}
                      {tier.perks?.elite_badge && (
                        <li className={styles.perkItem}>
                          <Check size={14} className={styles.checkIcon} />
                          <span>Elite profile status badges</span>
                        </li>
                      )}
                    </ul>

                    <button className={styles.selectBtn}>
                      Select {displayName}
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          )}

          <div className={styles.infoAlert}>
            <Info size={16} className={styles.infoIcon} />
            <p>
              Rewards are credited upon passing manual winner review checks. Transactions are transparently recorded in your wallet history.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function AwardBadge({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}
