// src/app/terms/page.tsx
import React from "react";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { FileText } from "lucide-react";
import styles from "./page.module.css";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <FileText size={40} className={styles.icon} />
            <h1 className={styles.title}>Terms of Service</h1>
            <p className={styles.subtitle}>Please review the legal rules governing prediction entry and payout release flows.</p>
          </div>

          <GlassCard className={styles.contentCard} hoverEffect={false}>
            <section className={styles.section}>
              <h2>1. Platform Eligibility</h2>
              <p>
                By creating an account on NanoPlay, you agree to comply with our security protocols. Each user is permitted exactly one account. Accounts must be registered with a valid, normalized phone number that you own.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Anti-Abuse & Multi-Accounting</h2>
              <p>
                We enforce strict fraud detection systems. Sharing a bank account number across multiple profiles is prohibited. Any detected overlap in bank account numbers, device fingerprints, or IP addresses between referrers and referees will result in immediate profile flagging and suspension of all payouts.
              </p>
            </section>

            <section className={styles.section}>
              <h2>3. Kickoff Time Lock & Predictions</h2>
              <p>
                Predictions lock automatically at the moment of match kickoff. Any attempts to alter picks after kickoff will fail due to database triggers, and any manual overrides are invalid.
              </p>
            </section>

            <section className={styles.section}>
              <h2>4. Winner Auditing & Winnings</h2>
              <p>
                Winnings are calculated strictly as wallet ledger items. Completing a prediction streak places your reward in the manual winner review queue. Payouts are released only after security validation and kyc approval.
              </p>
            </section>

            <section className={styles.section}>
              <h2>5. Wallet Ledger Integrity</h2>
              <p>
                Winnings and withdrawals are driving factors of the wallet balance, computed exclusively as the sum of transaction logs. Arbitrary adjustments to account balances are disabled.
              </p>
            </section>
          </GlassCard>
        </div>
      </main>
    </>
  );
}
