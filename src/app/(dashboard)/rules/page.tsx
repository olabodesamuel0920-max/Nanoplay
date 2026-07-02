// src/app/(dashboard)/rules/page.tsx
import React from "react";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { BookOpen, ShieldCheck, Lock, Users, Wallet, Landmark } from "lucide-react";
import styles from "./page.module.css";

export default function RulesPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <BookOpen className={styles.bookIcon} />
              <div>
                <h1 className={styles.title}>Rules & Integrity Guide</h1>
                <p className={styles.subtitle}>
                  Understand the rules of the play arena, payout gates, and fraud-prevention matrices.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            {/* Play Arena Mechanics */}
            <GlassCard className={styles.ruleCard} hoverEffect={false}>
              <div className={styles.cardHeader}>
                <BookOpen className={styles.cardIcon} />
                <h3>1. Play Arena Mechanics</h3>
              </div>
              <ul className={styles.list}>
                <li>A challenge round consists of exactly 3 scheduled football matches.</li>
                <li>To win, you must correctly predict the outcome (Home Win [1], Draw [X], Away Win [2]) for all 3 matches.</li>
                <li>Your entry amount is determined by your chosen challenge tier: Starter Challenge (NGN 5,000), Main Event (NGN 10,000), or Premium Challenge (NGN 20,000).</li>
                <li>Completing a 3-match winning streak qualifies you for the listed tier reward after manual review.</li>
              </ul>
            </GlassCard>

            {/* Kickoff Lock System */}
            <GlassCard className={styles.ruleCard} hoverEffect={false}>
              <div className={styles.cardHeader}>
                <Lock className={styles.cardIcon} />
                <h3>2. Kickoff Lock Integrity</h3>
              </div>
              <ul className={styles.list}>
                <li>Matches lock automatically at their scheduled kickoff time.</li>
                <li>No predictions can be created, updated, or deleted once a match has kicked off.</li>
                <li>Database triggers enforce this constraint. Backdated or modified predictions are rejected immediately.</li>
              </ul>
            </GlassCard>

            {/* Anti-Abuse Controls */}
            <GlassCard className={styles.ruleCard} hoverEffect={false}>
              <div className={styles.cardHeader}>
                <ShieldCheck className={styles.cardIcon} />
                <h3>3. Anti-Abuse Policies</h3>
              </div>
              <ul className={styles.list}>
                <li><strong>One Phone = One Account:</strong> Users must verify their phone number via one-time password (OTP) before they can submit predictions.</li>
                <li><strong>Unique Bank Payouts:</strong> Entering a bank account number shared by another user immediately flags both accounts for manual security review.</li>
                <li><strong>Security Monitoring:</strong> We monitor account logs for shared details and self-referral patterns. Duplicate or high-risk accounts are flagged for manual security review and may be blocked.</li>
              </ul>
            </GlassCard>

            {/* Wallet & Transactions */}
            <GlassCard className={styles.ruleCard} hoverEffect={false}>
              <div className={styles.cardHeader}>
                <Wallet className={styles.cardIcon} />
                <h3>4. Wallet & Transaction Security</h3>
              </div>
              <ul className={styles.list}>
                <li>NanoPlay uses a secure transaction record. Your wallet balance is the sum of transaction records.</li>
                <li>Tiers are purchased directly using your wallet balance.</li>
                <li>Webhooks with unique Paystack references prevent duplicate payments or double-credits.</li>
              </ul>
            </GlassCard>

            {/* Verification & Payout Queue */}
            <GlassCard className={styles.ruleCard} hoverEffect={false}>
              <div className={styles.cardHeader}>
                <Landmark className={styles.cardIcon} />
                <h3>5. Winner & Payout Reviews</h3>
              </div>
              <ul className={styles.list}>
                <li>When you complete a streak, your entry goes into the <strong>Admin Winner Review Queue</strong>.</li>
                <li>Admin manually audits your account logs (IP, phone, payout details) before verifying the win.</li>
                <li>Once approved, the round reward is credited to your wallet balance.</li>
                <li>Payouts require completed payout verification (Full Name, Date of Birth, ID type, bank details).</li>
              </ul>
            </GlassCard>

            {/* Referral Network */}
            <GlassCard className={styles.ruleCard} hoverEffect={false}>
              <div className={styles.cardHeader}>
                <Users className={styles.cardIcon} />
                <h3>6. Referral Terms</h3>
              </div>
              <ul className={styles.list}>
                 <li>Earn NGN 1,000 for every friend who joins, verifies their phone number, enters a round, and submits predictions.</li>
                <li>Self-referrals (sharing IP, bank accounts, or device fingerprints with your referee) are blocked, flag both profiles, and suspend payouts.</li>
              </ul>
            </GlassCard>
          </div>

          <div style={{ marginTop: "32px", padding: "20px 24px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-glass)", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "var(--foreground-muted)", lineHeight: "1.6" }}>
              <strong>Public Disclaimer:</strong> NanoPlay is an independent sports gaming arena. We are not affiliated, associated, authorized, or in any way officially connected with FIFA, UEFA, European Premier League, or any professional football clubs or players. All team names, marks, and visuals used inside the arena are generic.
            </p>
            <p style={{ fontSize: "12px", color: "var(--foreground-secondary)", marginTop: "8px" }}>
              For support inquiries, reach out to <strong>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@nanoplay.com"}</strong> or WhatsApp: <strong>{process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+2348000000000"}</strong>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
