// src/app/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/glass-card";
import Navbar from "@/components/layouts/navbar";
import Logo from "@/components/ui/logo";
import { 
  ShieldCheck, 
  Lock, 
  Wallet, 
  Eye, 
  Activity
} from "lucide-react";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Glow Spotlights */}
        <div className={styles.glowTop}></div>
        <div className={styles.glowMid}></div>

        {/* 1. HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.heroGrid}>
            
            {/* Left Side: Editorial Typography & Copy */}
            <div className={styles.heroLeft}>
              <div className={styles.badgeRow}>
                <span className={styles.heroBadge}><span className={styles.pulseDot}></span>LIVE ARENA ACTIVE</span>
                <span className={styles.heroBadge}>VERIFIED PICKS</span>
                <span className={styles.heroBadge}>LEDGER PROTECTED</span>
              </div>
              
              <h1 className={styles.heroTitle}>
                COMMAND<br />
                THE <span className={styles.heroTitleAccent}>PITCH.</span>
              </h1>
              
              <p className={styles.heroSubtitleLine}>
                Build your streak. Qualify for verified rewards.
              </p>
              
              <p className={styles.heroSubtitle}>
                NanoPlay is an elite football prediction arena where every pick is locked, every account is verified, and every reward passes secure review.
              </p>
              
              <div className={styles.heroCta}>
                <Link href="/signup" className="btn-premium">
                  <span>Join Arena</span>
                </Link>
                <Link href="/rules" className="btn-glass">
                  View Rules
                </Link>
              </div>
            </div>

            {/* Right Side: Upgraded 3D Floating Arena Terminal */}
            <div className={styles.heroRight}>
              <div className={styles.terminalGlow}></div>
              
              {/* Stacked depth cards behind terminal */}
              <div className={styles.terminalBackCard1}></div>
              <div className={styles.terminalBackCard2}></div>
              
              <div className={styles.terminal3D}>
                <div className={styles.terminalHeader}>
                  <div className={styles.terminalDots}>
                    <span></span><span></span><span></span>
                  </div>
                  <div className={styles.terminalTitle}>NANOPLAY CORE ENGINE</div>
                  <div className={styles.terminalStatus}>
                    <span className={styles.terminalPulse}></span>
                    <span>SECURE LOGS</span>
                  </div>
                </div>

                <div className={styles.terminalContent}>
                  {/* Top Stats Banner */}
                  <div className={styles.terminalStats}>
                    <div className={styles.termStatChip}>
                      <span className={styles.termStatLabel}>CHALLENGE BALANCE</span>
                      <span className={styles.termStatVal}>₦60,000</span>
                    </div>
                    <div className={styles.termStatChip}>
                      <span className={styles.termStatLabel}>STREAK INDEX</span>
                      <span className={styles.termStatVal} style={{ color: "var(--accent-gold)" }}>3 ACTIVE</span>
                    </div>
                  </div>

                  {/* Match Item Preview */}
                  <div className={styles.terminalMatchCard}>
                    <div className={styles.termMatchMeta}>
                      <span>MATCHDAY 3 (LOCK GATE)</span>
                      <span className={styles.termLockBadge}>
                        <Lock size={10} />
                        <span>KICKOFF LOCK</span>
                      </span>
                    </div>
                    <div className={styles.termMatchTeams}>
                      <div className={styles.termTeam}>ARSENAL</div>
                      <div className={styles.termVs}>VS</div>
                      <div className={styles.termTeam}>MAN CITY</div>
                    </div>
                    <div className={styles.termPredictionOptions}>
                      <button className={styles.termPredBtn}>1</button>
                      <button className={[styles.termPredBtn, styles.termPredBtnActive].join(" ")}>X</button>
                      <button className={styles.termPredBtn}>2</button>
                    </div>
                  </div>

                  {/* Terminal Log Output */}
                  <div className={styles.terminalLog}>
                    <span className={styles.logMeta}>[SYSTEM LOGS]</span>
                    <div className={styles.logLine}>&gt; Verified access check: OK</div>
                    <div className={styles.logLine}>&gt; Kickoff validation check: locked</div>
                    <div className={styles.logLine} style={{ color: "var(--accent-gold)" }}>&gt; Pool reward ledger transaction ready</div>
                  </div>
                </div>
              </div>

              {/* Floating Chips */}
              <div className={[styles.floatingChip, styles.chip1].join(" ")}>LOCKED PICK</div>
              <div className={[styles.floatingChip, styles.chip2].join(" ")}>LEDGER READY</div>
              <div className={[styles.floatingChip, styles.chip3].join(" ")}>REVIEW QUEUE</div>
              <div className={[styles.floatingChip, styles.chip4].join(" ")}>PHONE VERIFIED</div>
            </div>

          </div>
        </section>

        {/* 2. OPERATIONAL TRUST STRIP */}
        <section className={styles.trustStrip}>
          <div className={styles.trustStripGrid}>
            <div className={styles.trustStripItem}>
              <Activity size={18} className={styles.trustIcon} />
              <div className={styles.trustLabel}>
                <span className={styles.trustVal}>SYSTEM STATUS</span>
                <span className={styles.trustDesc}>VERIFIED</span>
              </div>
            </div>
            <div className={styles.trustStripItem}>
              <Eye size={18} className={styles.trustIcon} />
              <div className={styles.trustLabel}>
                <span className={styles.trustVal}>REWARD FLOW</span>
                <span className={styles.trustDesc}>MANUAL AUDIT</span>
              </div>
            </div>
            <div className={styles.trustStripItem}>
              <Wallet size={18} className={styles.trustIcon} />
              <div className={styles.trustLabel}>
                <span className={styles.trustVal}>WALLET MODE</span>
                <span className={styles.trustDesc}>LEDGER PROTECTED</span>
              </div>
            </div>
            <div className={styles.trustStripItem}>
              <ShieldCheck size={18} className={styles.trustIcon} />
              <div className={styles.trustLabel}>
                <span className={styles.trustVal}>ACCESS GATE</span>
                <span className={styles.trustDesc}>PHONE VERIFIED</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW NANOPLAY WORKS */}
        <section className={styles.howItWorksSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionSubtitleLabel}>STEP-BY-STEP ARENA</div>
            <h2 className={styles.sectionTitle}>
              How <span className={styles.editorialItalicTitle}>NanoPlay</span> Works
            </h2>
            <p className={styles.sectionSubtitle}>
              Four steps to predict matches, verify predictions, and unlock pool rewards securely.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {[
              { num: "I", title: "Select Tier", desc: "Choose your challenge entry tier: Starter, Standard, or Premium using your wallet balance." },
              { num: "II", title: "Place Predictions", desc: "Submit picks on the matches before their kickoff locks. Phone OTP verification required." },
              { num: "III", title: "Lock & Settle", desc: "Our system settles match scores. Complete your prediction streak successfully." },
              { num: "IV", title: "Verify & Release", desc: "Winners pass the audit queue before reward is credited to your wallet ledger." }
            ].map((step, i) => (
              <div key={i} className={styles.stepCard}>
                <span className={styles.stepNum}>{step.num}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. ELITE TRUST & SECURITY LAYER */}
        <section className={styles.securitySection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionSubtitleLabel}>PLATFORM SECURITY</div>
            <h2 className={styles.sectionTitle}>
              Anti-Abuse <span className={styles.editorialItalicTitle}>Safeguards</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              NanoPlay features production-grade anti-abuse safeguards to protect the pool integrity.
            </p>
          </div>

          <div className={styles.securityGrid}>
            {[
              { cmd: "sys_phone_auth", title: "Verified Phone Access", desc: "Strict OTP verification triggers block multiple accounts from using the same phone number." },
              { cmd: "sys_device_audit", title: "Duplicate Account Protection", desc: "Shared bank details or device fingerprints trigger suspensions automatically." },
              { cmd: "sys_ledger_verification", title: "Secure Wallet Ledger", desc: "Wallet balances are driven strictly by verified, chronological ledger logs." },
              { cmd: "sys_kickoff_lock", title: "Kickoff Pick Lock", desc: "Immutable database triggers lock prediction edits the moment a match kicks off." },
              { cmd: "sys_payout_review", title: "Reward Review Queue", desc: "All winning streaks are audited in the manual review queue before payout release." },
              { cmd: "sys_fraud_shield", title: "Active Fraud Shield", desc: "Real-time verification of IP overlaps, fingerprint profiles, and referral patterns." }
            ].map((sec, i) => {
              return (
                <div key={i} className={styles.securityCard}>
                  <div className={styles.securityCardHeader}>
                    <span className={styles.securityCmd}>{sec.cmd}</span>
                    <span className={styles.securityStatus}>[ ACTIVE ]</span>
                  </div>
                  <h3 className={styles.securityCardTitle}>{sec.title}</h3>
                  <p className={styles.securityCardDesc}>
                    <span className={styles.cmdIndicator}>&gt;</span> {sec.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. FINAL CTA */}
        <section className={styles.ctaSection}>
          <GlassCard className={styles.ctaCard} accent={true} hoverEffect={false}>
            <h2 className={styles.ctaTitle}>Join the streak arena</h2>
            <p className={styles.ctaDesc}>
              Join the elite sports-tech football challenge. Build your streak and claim rewards on a secure ledger.
            </p>
            <Link href="/signup" className="btn-premium">
              <span>Join Arena</span>
            </Link>
          </GlassCard>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.footerGrid}>
              
              {/* Col 1: Logo & Desc */}
              <div className={styles.footerCol}>
                <div className={styles.footerLogoRow}>
                  <Logo size={32} showText={true} />
                </div>
                <p className={styles.footerDesc}>
                  An elite sports-tech prediction challenge platform built for fair play, transaction integrity, and streak competitions.
                </p>
                <div className={styles.socialLinks}>
                  <span className={styles.socialItem}>Twitter (Inactive)</span>
                  <span className={styles.socialItem}>Discord (Inactive)</span>
                  <span className={styles.socialItem}>Telegram (Inactive)</span>
                </div>
              </div>

              {/* Col 2: Arena links */}
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Prediction Arena</h4>
                <ul className={styles.footerLinks}>
                  <li><Link href="/arena" className={styles.footerLink}>Play Arena</Link></li>
                  <li><Link href="/dashboard" className={styles.footerLink}>User Dashboard</Link></li>
                  <li><Link href="/rules" className={styles.footerLink}>Rules & Guides</Link></li>
                  <li><Link href="/tiers" className={styles.footerLink}>Challenge Tiers</Link></li>
                </ul>
              </div>

              {/* Col 3: Community links */}
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Community</h4>
                <ul className={styles.footerLinks}>
                  <li><Link href="/faq" className={styles.footerLink}>FAQ & Help</Link></li>
                  <li><Link href="/leaderboard" className={styles.footerLink}>Leaderboards</Link></li>
                  <li><Link href="/security" className={styles.footerLink}>Security Hub</Link></li>
                </ul>
              </div>

              {/* Col 4: Legal links */}
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Legal Info</h4>
                <ul className={styles.footerLinks}>
                  <li><Link href="/terms" className={styles.footerLink}>Terms of Service</Link></li>
                  <li><Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link></li>
                </ul>
              </div>

            </div>

            {/* Bottom copyright and status tags */}
            <div className={styles.footerBottom}>
              <p className={styles.footerCopyright}>
                &copy; {new Date().getFullYear()} NanoPlay. All rights reserved.
              </p>
              <div className={styles.footerBottomBadges}>
                <span className={styles.footerBottomBadge}>VERIFIED OPERATIONAL</span>
                <span className={styles.footerBottomBadge}>LEDGER PROTECTED</span>
                <span className={styles.footerBottomBadge}>VERIFIED ACCESS</span>
              </div>
            </div>

          </div>
        </footer>
      </main>
    </>
  );
}
