// src/app/privacy/page.tsx
import React from "react";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { ShieldCheck } from "lucide-react";
import styles from "./page.module.css";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <ShieldCheck size={40} className={styles.icon} />
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.subtitle}>Understand how we collect and secure your registration and security parameters.</p>
          </div>

          <GlassCard className={styles.contentCard} hoverEffect={false}>
            <section className={styles.section}>
              <h2>1. Data Collection Scope</h2>
              <p>
                To maintain prediction integrity, we collect your full legal name, date of birth, email address, phone number, and bank details. In addition, our security engine logs device fingerprints and IP addresses on sign up and login.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Purpose of Processing</h2>
              <p>
                Your phone number is processed to verify access. Your bank account info and device fingerprints are analyzed by our database triggers to identify potential duplicate accounts, referral self-abuse, and multiple registrations from single devices.
              </p>
            </section>

            <section className={styles.section}>
              <h2>3. Data Protection and Storage</h2>
              <p>
                All account and transaction data are stored securely. Winnings transaction records and sensitive KYC details are protected against unauthorized access and are never exposed to external clients.
              </p>
            </section>

            <section className={styles.section}>
              <h2>4. Third-Party Sharing</h2>
              <p>
                NanoPlay does not sell or share your identity details, phone numbers, bank accounts, or security metrics with third-party advertising companies. Your data is used strictly for prediction validation and withdrawal release processes.
              </p>
            </section>
          </GlassCard>
        </div>
      </main>
    </>
  );
}
