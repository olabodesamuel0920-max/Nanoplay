// src/app/faq/page.tsx
"use client";

import React, { useState } from "react";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./page.module.css";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is NanoPlay?",
      a: "NanoPlay is an elite football prediction challenge platform where users choose prediction tiers, place matchday outcomes, build streaks, and qualify for rewards.",
    },
    {
      q: "How does the Phone verification work?",
      a: "To guarantee fair play, each account is bound to exactly one unique phone number. Before submitting any predictions, you must request and complete SMS phone verification.",
    },
    {
      q: "What happens if a bank account is linked to multiple profiles?",
      a: "NanoPlay enforces a strict one bank account per user safeguard. If our system detects the same bank details shared across accounts, both profiles are flagged, and all payout operations are suspended pending audit review.",
    },
    {
      q: "How does the secure wallet function?",
      a: "Unlike typical systems with arbitrary balances, your NanoPlay wallet balance is calculated as the sum of verified transactions. Deposits, challenge passes, and approved rewards are recorded clearly.",
    },
    {
      q: "When are predictions locked?",
      a: "Match predictions lock immediately at the official kickoff time. Our database enforces this lock automatically, preventing changes once a match starts.",
    },
    {
      q: "How does the manual winner review queue work?",
      a: "Once you complete a correct prediction streak, your entry is placed in the review queue. Admins audit device fingerprints, IP overlaps, and account flags to confirm fair play before releasing rewards.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <HelpCircle size={40} className={styles.icon} />
            <h1 className={styles.title}>FAQ & Support</h1>
            <p className={styles.subtitle}>Frequently asked questions about the prediction arena and security safeguards.</p>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <GlassCard key={i} className={styles.faqCard} hoverEffect={false}>
                  <div className={styles.questionRow} onClick={() => toggleFaq(i)}>
                    <h3 className={styles.question}>{faq.q}</h3>
                    {isOpen ? <ChevronUp size={20} className={styles.arrow} /> : <ChevronDown size={20} className={styles.arrow} />}
                  </div>
                  {isOpen && (
                    <div className={styles.answerContainer}>
                      <p className={styles.answer}>{faq.a}</p>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>

          {/* Support Channels & Trust Disclaimers */}
          <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            <GlassCard style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", marginBottom: "12px", color: "var(--accent-gold)" }}>Contact Support</h3>
              <p style={{ fontSize: "14px", color: "var(--foreground-secondary)", marginBottom: "16px" }}>
                Our customer experience team is available to assist you with phone verifications, transaction audits, or account reviews.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "var(--foreground-muted)" }}>Email Support:</span>{" "}
                  <strong style={{ color: "var(--foreground-primary)" }}>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@nanoplay.com"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--foreground-muted)" }}>WhatsApp chat:</span>{" "}
                  <strong style={{ color: "var(--foreground-primary)" }}>{process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+2348000000000"}</strong>
                </div>
              </div>
            </GlassCard>

            <GlassCard style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", marginBottom: "12px", color: "var(--accent-cyan)" }}>Fair Play & Integrity</h3>
              <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--foreground-secondary)", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>Rewards are subject to manual security audit and verification reviews before being approved and credited.</li>
                <li>Payout verification (identity/bank registration) is strictly required to request and execute wallet withdrawals.</li>
                <li>Phone number verification prevents duplicate entry abuses and protects round registration allocations.</li>
                <li>NanoPlay is not affiliated with FIFA, UEFA, European Leagues, or any professional football clubs.</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </main>
    </>
  );
}
