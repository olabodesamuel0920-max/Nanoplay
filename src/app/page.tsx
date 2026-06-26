// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GlassCard from "@/components/ui/glass-card";
import Navbar from "@/components/layouts/navbar";
import { Trophy, ShieldAlert, Award, Zap, ChevronRight, Check } from "lucide-react";
import styles from "./page.module.css";

export default function LandingPage() {
  const supabase = createClient();
  const [tiers, setTiers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTiers() {
      const { data } = await supabase
        .from("account_tiers")
        .select("*")
        .eq("is_active", true)
        .order("price_ngn", { ascending: true });
      if (data) {
        setTiers(data);
      }
    }
    fetchTiers();
  }, []);

  // Standard tiers if database is not seeded yet
  const displayTiers = tiers.length > 0 ? tiers : [
    { name: "Starter", price_ngn: 5000, perks: { reward: "₦50,000", predictions_per_round: 3, referral_bonus: 1000 } },
    { name: "Standard", price_ngn: 10000, perks: { reward: "₦100,000", predictions_per_round: 3, referral_bonus: 1000, priority: true } },
    { name: "Premium", price_ngn: 20000, perks: { reward: "₦200,000", predictions_per_round: 3, referral_bonus: 1000, priority: true, elite_badge: true } }
  ];

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Glow Effects */}
        <div className={styles.glowTop}></div>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.tagline}>
              <Zap size={14} className={styles.tagIcon} />
              <span>THE ULTIMATE SPORTS-TECH ARENA</span>
            </div>
            <h1 className={styles.heroTitle}>
              Predict Football.<br />
              Build Streaks.<br />
              Claim <span className={styles.gradientText}>Elite Rewards</span>.
            </h1>
            <p className={styles.heroSubtitle}>
              NanoPlay is a premium sports-tech prediction platform featuring absolute ledger security, unique mobile-first glass card dashboard, and strict anti-abuse verification.
            </p>
            <div className={styles.heroCta}>
              <Link href="/arena" className="btn-premium">
                <span>Enter Play Arena</span>
                <ChevronRight size={18} />
              </Link>
              <Link href="/rules" className="btn-glass">
                Learn Rules
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>₦500k+</div>
              <div className={styles.statLabel}>Weekly Pools</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>10X</div>
              <div className={styles.statLabel}>Reward Multipier</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>100%</div>
              <div className={styles.statLabel}>Ledger Verified</div>
            </div>
          </div>
        </section>

        {/* Features / Anti-Abuse Section */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built on Absolute Trust</h2>
            <p className={styles.sectionSubtitle}>
              Our production-grade anti-abuse mechanisms ensure a fair challenge with no bots, no duplicate accounts, and verifiable winners only.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <GlassCard hoverEffect={true}>
              <ShieldAlert className={styles.featureIcon} />
              <h3 className={styles.featureTitle}>One Phone, One Account</h3>
              <p className={styles.featureDesc}>
                Strict phone OTP verification is required before submission. Duplicate phone numbers are blocked instantly.
              </p>
            </GlassCard>

            <GlassCard hoverEffect={true}>
              <Trophy className={styles.featureIcon} />
              <h3 className={styles.featureTitle}>Strict Kickoff Locks</h3>
              <p className={styles.featureDesc}>
                All matches lock automatically the second the whistle blows. No backdated or falsified entries.
              </p>
            </GlassCard>

            <GlassCard hoverEffect={true}>
              <Award className={styles.featureIcon} />
              <h3 className={styles.featureTitle}>Double Bank Protection</h3>
              <p className={styles.featureDesc}>
                Entering a bank account number shared by another profile immediately flags both for manual admin review.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Tiers Pricing Section */}
        <section className={styles.tiersSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Select Your Challenge Tier</h2>
            <p className={styles.sectionSubtitle}>
              Unlock higher reward pools and exclusive badges. Win 10X your entry fee on completing a 3-match prediction streak.
            </p>
          </div>

          <div className={styles.tiersGrid}>
            {displayTiers.map((tier: any) => (
              <GlassCard
                key={tier.name}
                accent={tier.name === "Standard" || tier.name === "Premium"}
                className={styles.tierCard}
              >
                <div className={styles.tierHeader}>
                  <h3 className={styles.tierName}>{tier.name}</h3>
                  <div className={styles.tierPrice}>
                    ₦{tier.price_ngn.toLocaleString()}
                    <span className={styles.pricePeriod}> / Entry</span>
                  </div>
                </div>

                <ul className={styles.perksList}>
                  <li className={styles.perkItem}>
                    <Check size={16} className={styles.perkCheck} />
                    <span>Reward Potential: <strong>{tier.perks?.reward}</strong></span>
                  </li>
                  <li className={styles.perkItem}>
                    <Check size={16} className={styles.perkCheck} />
                    <span>Matches: 3 predictions per round</span>
                  </li>
                  <li className={styles.perkItem}>
                    <Check size={16} className={styles.perkCheck} />
                    <span>Referral Credit: ₦1,000 per sign up</span>
                  </li>
                  {tier.perks?.priority && (
                    <li className={styles.perkItem}>
                      <Check size={16} className={styles.perkCheck} />
                      <span>Priority Withdrawal queue</span>
                    </li>
                  )}
                  {tier.perks?.elite_badge && (
                    <li className={styles.perkItem}>
                      <Check size={16} className={styles.perkCheck} />
                      <span>Elite profile badges</span>
                    </li>
                  )}
                </ul>

                <Link href="/arena" className={["btn-premium", styles.tierBtn].join(" ")}>
                  Select {tier.name}
                </Link>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.footerLogo}>
              NANO<span className={styles.accent}>PLAY</span>
            </div>
            <p className={styles.footerCopyright}>
              &copy; {new Date().getFullYear()} NanoPlay. Production-grade sports-tech platform. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
