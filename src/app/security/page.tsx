// src/app/security/page.tsx
import React from "react";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { ShieldAlert, Fingerprint, Lock, ShieldCheck, Database } from "lucide-react";
import styles from "./page.module.css";

export default function SecurityPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <ShieldAlert size={40} className={styles.icon} />
            <h1 className={styles.title}>Security & Transparency Hub</h1>
            <p className={styles.subtitle}>Explore the guardrails that protect the challenge pool and secure player rewards.</p>
          </div>

          <div className={styles.grid}>
            <GlassCard className={styles.card} hoverEffect={true}>
              <div className={styles.cardHeader}>
                <ShieldCheck className={styles.cardIcon} />
                <h3>Verified Phone Access</h3>
              </div>
              <p className={styles.cardText}>
                We enforce a strict 1-to-1 association between users and phone numbers. Predictions are restricted unless the phone number is verified via SMS OTP, preventing automated bulk accounts.
              </p>
            </GlassCard>

            <GlassCard className={styles.card} hoverEffect={true}>
              <div className={styles.cardHeader}>
                <Fingerprint className={styles.cardIcon} />
                <h3>Account Safety Check</h3>
              </div>
              <p className={styles.cardText}>
                Our system flags profiles sharing bank accounts or security device checks. Winnings remain suspended for flagged accounts pending security review.
              </p>
            </GlassCard>

            <GlassCard className={styles.card} hoverEffect={true}>
              <div className={styles.cardHeader}>
                <Lock className={styles.cardIcon} />
                <h3>Kickoff Lock</h3>
              </div>
              <p className={styles.cardText}>
                Predictions are locked at kickoff time by our automated system. Picks cannot be submitted or modified post-kickoff, preventing retrospective prediction edits.
              </p>
            </GlassCard>

            <GlassCard className={styles.card} hoverEffect={true}>
              <div className={styles.cardHeader}>
                <Database className={styles.cardIcon} />
                <h3>Secure Wallet History</h3>
              </div>
              <p className={styles.cardText}>
                Player balances are computed solely as the sum of confirmed transactions. This transaction history prevents arbitrary balance updates and keeps records transparent.
              </p>
            </GlassCard>
          </div>

          <GlassCard className={styles.auditBox} hoverEffect={false}>
            <h3>Manual Winner Review</h3>
            <p>
              When a player completes a correct match prediction streak, the system routes the entry to the pending winners review queue. Admins audit access parameters to verify fair play before releasing rewards to the wallet.
            </p>
          </GlassCard>
        </div>
      </main>
    </>
  );
}
