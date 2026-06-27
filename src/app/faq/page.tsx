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
      a: "NanoPlay is an elite football prediction challenge platform where users choose prediction tiers, place matchday outcomes, build streaks, and claim rewards on a secure transaction ledger.",
    },
    {
      q: "How does the Phone OTP verification work?",
      a: "To guarantee fair play, each account is bound to exactly one unique phone number. Before submitting any predictions, you must request and complete SMS OTP phone verification.",
    },
    {
      q: "What happens if a bank account is linked to multiple profiles?",
      a: "NanoPlay enforces a strict one bank account per user safeguard. If our system detects the same bank details shared across accounts, both profiles are flagged, and all payout operations are suspended pending audit review.",
    },
    {
      q: "How does the secure wallet ledger function?",
      a: "Unlike typical systems with arbitrary balances, your NanoPlay wallet balance is calculated as the sum of verified ledger transactions. Deposits, entry fees, and approved rewards are recorded as immutable items.",
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
        </div>
      </main>
    </>
  );
}
