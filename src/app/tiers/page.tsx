// src/app/tiers/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Check, Info } from "lucide-react";
import styles from "./page.module.css";

export default function TiersPage() {
  const supabase = createClient();
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      }
    }
    fetchTiers();
  }, []);

  const fallbackTiers = [
    { name: "Starter", price_ngn: 5000, perks: { reward: "NGN 50,000 potential reward", predictions_per_round: 3, referral_bonus: 1000 } },
    { name: "Standard", price_ngn: 10000, perks: { reward: "NGN 100,000 potential reward", predictions_per_round: 3, referral_bonus: 1000, priority: true } },
    { name: "Premium", price_ngn: 20000, perks: { reward: "NGN 200,000 potential reward", predictions_per_round: 3, referral_bonus: 1000, priority: true, elite_badge: true } }
  ];

  const displayTiers = tiers.length > 0 ? tiers : fallbackTiers;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <AwardBadge size={40} className={styles.icon} />
            <h1 className={styles.title}>Challenge Tiers</h1>
            <p className={styles.subtitle}>Select a tier to begin. Complete your 3-match prediction streak to qualify for the round reward.</p>
          </div>

          {loading ? (
            <div className={styles.loading}>LOADING CHALLENGE TIERS...</div>
          ) : (
            <div className={styles.grid}>
              {displayTiers.map((tier) => (
                <GlassCard key={tier.name} className={styles.card} accent={tier.name !== "Starter"} hoverEffect={true}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.tierName}>{tier.name}</h3>
                    <div className={styles.priceRow}>
                      <span className={[styles.price, "font-data"].join(" ")}>NGN {tier.price_ngn.toLocaleString()}</span>
                      <span className={styles.period}>/ entry fee</span>
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
                    Select {tier.name}
                  </button>
                </GlassCard>
              ))}
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
