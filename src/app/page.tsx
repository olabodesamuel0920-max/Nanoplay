// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GlassCard from "@/components/ui/glass-card";
import Navbar from "@/components/layouts/navbar";
import { Trophy, ShieldAlert, Award, Zap, ChevronRight, Check, Shield, Lock, Wallet, Eye, ShieldCheck, HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";
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
        <div className={styles.glowMid}></div>

        {/* 1. PREMIUM HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.heroGrid}>
            
            {/* Left Side: Hero Copy */}
            <div className={styles.heroLeft}>
              <div className={styles.badgeRow}>
                <span className={styles.heroBadge}><span className={styles.pulseDot}></span>LIVE ARENA SYSTEM</span>
                <span className={styles.heroBadge}>VERIFIED PICKS</span>
                <span className={styles.heroBadge}>SECURE WALLET LEDGER</span>
                <span className={styles.heroBadge}>ANTI-ABUSE ENGINE</span>
              </div>
              
              <h1 className={styles.heroTitle}>
                Predict Football.<br />
                Build Streaks.<br />
                Claim <span className="text-glow-lime">Verified Rewards</span>.
              </h1>
              
              <p className={styles.heroSubtitle}>
                NanoPlay is a premium football streak arena where every pick is locked, every account is verified, and every reward moves through a secure audit flow.
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

              <div className={styles.trustFooter}>
                <div className={styles.trustItem}>
                  <ShieldCheck size={18} className={styles.trustIcon} />
                  <span>1 Phone = 1 Account</span>
                </div>
                <div className={styles.trustItem}>
                  <ShieldCheck size={18} className={styles.trustIcon} />
                  <span>Double Bank Flags</span>
                </div>
              </div>
            </div>

            {/* Right Side: 3D Floating Arena Terminal */}
            <div className={styles.heroRight}>
              <div className={styles.terminal3D}>
                <div className={styles.terminalHeader}>
                  <div className={styles.terminalDots}>
                    <span></span><span></span><span></span>
                  </div>
                  <div className={styles.terminalTitle}>NANOPLAY CORE ENGINE v1.2</div>
                  <div className={styles.terminalStatus}>
                    <span className={styles.terminalPulse}></span>
                    <span>SECURE</span>
                  </div>
                </div>

                <div className={styles.terminalContent}>
                  {/* Top Stats Banner */}
                  <div className={styles.terminalStats}>
                    <div className={styles.termStatChip}>
                      <span className={styles.termStatLabel}>WALLET BALANCE</span>
                      <span className={styles.termStatVal}>₦45,000</span>
                    </div>
                    <div className={styles.termStatChip}>
                      <span className={styles.termStatLabel}>ACTIVE STREAK</span>
                      <span className={styles.termStatVal} style={{ color: "var(--accent-lime)" }}>2 / 3 WINS</span>
                    </div>
                  </div>

                  {/* Match Item Preview */}
                  <div className={styles.terminalMatchCard}>
                    <div className={styles.termMatchMeta}>
                      <span>MATCHDAY 3 (FINAL GATE)</span>
                      <span className={styles.termLockBadge}>
                        <Lock size={10} />
                        <span>LOCKS IN 14M 32S</span>
                      </span>
                    </div>
                    <div className={styles.termMatchTeams}>
                      <div className={styles.termTeam}>REAL MADRID</div>
                      <div className={styles.termVs}>VS</div>
                      <div className={styles.termTeam}>BARCELONA</div>
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
                    <div className={styles.logLine}>&gt; DEVICE FINGERPRINT SECURED: OK</div>
                    <div className={styles.logLine}>&gt; normalized_phone constraint verified: +234803***1234</div>
                    <div className={styles.logLine} style={{ color: "var(--accent-lime)" }}>&gt; STREAK REWARD MULTIPLIER: 10X ACTIVE</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. LIVE ARENA PREVIEW SECTION */}
        <section className={styles.previewSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionSubtitleLabel}>LIVE ARENA FEEDS</div>
            <h2 className={styles.sectionTitle}>Dashboard Preview</h2>
            <p className={styles.sectionSubtitle}>
              Experience a high-end command interface. Place picks, track streaks, and monitor the verified audit queues.
            </p>
          </div>

          <div className={styles.previewGrid}>
            
            {/* Column 1: Match Cards */}
            <div className={styles.previewCol}>
              <h4 className={styles.colTitle}>Prediction Cards</h4>
              <div className={styles.previewMatchList}>
                {[
                  { day: 1, home: "Chelsea", away: "Arsenal", selected: "1", status: "LOCKED", score: "2 - 1", correct: true },
                  { day: 2, home: "Bayern Munich", away: "Dortmund", selected: "2", status: "LOCKED", score: "0 - 1", correct: true },
                  { day: 3, home: "Man City", away: "Liverpool", selected: "X", status: "LOCKS IN 12H", active: true }
                ].map((m, i) => (
                  <GlassCard key={i} className={[styles.previewMatch, m.active ? styles.previewMatchActive : ""].join(" ")} hoverEffect={false}>
                    <div className={styles.previewMatchMeta}>
                      <span>MATCHDAY {m.day}</span>
                      {m.status === "LOCKED" ? (
                        <span className={styles.lockedBadge}>
                          <Lock size={12} />
                          <span>{m.status}</span>
                        </span>
                      ) : (
                        <span className={styles.countdownBadge}>
                          <span>{m.status}</span>
                        </span>
                      )}
                    </div>
                    
                    <div className={styles.previewMatchTeams}>
                      <span>{m.home}</span>
                      <span className={styles.previewVs}>{m.score || "VS"}</span>
                      <span>{m.away}</span>
                    </div>

                    <div className={styles.previewOptions}>
                      {["1", "X", "2"].map((opt) => (
                        <button
                          key={opt}
                          className={[
                            styles.previewOptBtn,
                            m.selected === opt ? styles.previewOptBtnSelected : ""
                          ].join(" ")}
                          disabled
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {m.correct && (
                      <div className={styles.correctOverlay}>
                        <CheckCircle size={14} style={{ color: "var(--status-success)" }} />
                        <span>PREDICTION CORRECT</span>
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Column 2: Streaks & Ledger Chips */}
            <div className={styles.previewCol}>
              <h4 className={styles.colTitle}>Streak & Wallet Engine</h4>
              
              <div className={styles.engineStack}>
                <GlassCard className={styles.engineCard} accent={true}>
                  <div className={styles.engineHeader}>
                    <Trophy className="text-glow-lime" />
                    <span>Streak Multiplier</span>
                  </div>
                  <div className={styles.streakProgress}>
                    <div className={styles.streakNodeActive}><Check size={12} /></div>
                    <div className={styles.streakNodeLineActive}></div>
                    <div className={styles.streakNodeActive}><Check size={12} /></div>
                    <div className={styles.streakNodeLineActive}></div>
                    <div className={styles.streakNodePending}>3</div>
                  </div>
                  <p className={styles.engineDesc}>
                    Complete 3 consecutive correct predictions to unlock your <strong>10X pool multiplier</strong>.
                  </p>
                </GlassCard>

                <GlassCard className={styles.engineCard}>
                  <div className={styles.engineHeader}>
                    <Wallet className="text-glow-cyan" />
                    <span>Wallet Ledger</span>
                  </div>
                  <div className={styles.balanceRow}>
                    <span className={[styles.previewBalance, "font-data"].join(" ")}>₦105,000</span>
                    <span className="badge badge-success">Ledger Verified</span>
                  </div>
                  <p className={styles.engineDesc}>
                    Every deposit, entry fee, reward, and withdrawal is written as an immutable transaction ledger item.
                  </p>
                </GlassCard>

                <GlassCard className={styles.engineCard}>
                  <div className={styles.engineHeader}>
                    <Shield className={styles.engineIconCyan} />
                    <span>Winner Review Queue</span>
                  </div>
                  <div className={styles.queueStatusRow}>
                    <span className="badge badge-warning">Awaiting Audit</span>
                    <span className={styles.queueTimer}>QUEUED 4M AGO</span>
                  </div>
                  <p className={styles.engineDesc}>
                    Completed streaks enter the review queue for automated and manual security audits before wallet crediting.
                  </p>
                </GlassCard>
              </div>
            </div>

          </div>
        </section>

        {/* 3. HOW NANOPLAY WORKS */}
        <section className={styles.howItWorksSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionSubtitleLabel}>STEP-BY-STEP ARENA</div>
            <h2 className={styles.sectionTitle}>How NanoPlay Works</h2>
            <p className={styles.sectionSubtitle}>
              Four simple steps to predict, verify, and unlock pool rewards securely.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {[
              { num: "01", title: "Select Tier", desc: "Choose your challenge entry tier: Starter, Standard, or Premium using your wallet balance." },
              { num: "02", title: "Submit Picks", desc: "Place predictions on the 3 matches before their kickoff locks. Phone OTP verification required." },
              { num: "03", title: "Settle Round", desc: "Our system settles match scores and checks predictions. 3/3 correct predictions completes the streak." },
              { num: "04", title: "Release Reward", desc: "Completed streaks pass the manual audit queue and credit your wallet ledger with exactly 10X reward." }
            ].map((step, i) => (
              <GlassCard key={i} className={styles.stepCard} hoverEffect={true}>
                <span className={[styles.stepNum, "font-data"].join(" ")}>{step.num}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* 4. SECURITY & TRUST LAYER (Premium Grid) */}
        <section className={styles.securitySection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionSubtitleLabel}>SECURE INFRASTRUCTURE</div>
            <h2 className={styles.sectionTitle}>Day-One Anti-Abuse Core</h2>
            <p className={styles.sectionSubtitle}>
              We built NanoPlay as a premium Sports-Tech platform with production-grade safeguards to protect the pool integrity.
            </p>
          </div>

          <div className={styles.securityGrid}>
            {[
              { icon: ShieldCheck, title: "1 Phone = 1 Account", desc: "Strict Nigerian phone normalization triggers block multiple accounts with the same phone." },
              { icon: AlertTriangle, title: "Duplicate Bank Detection", desc: "Entering a bank account shared by another user flags both profiles and suspends payouts." },
              { icon: Lock, title: "KYC Payout Gate", desc: "Full legal name, DOB, ID document number, and verified phone are mandatory before withdrawals." },
              { icon: Shield, title: "Locked Predictions", desc: "Database triggers lock predictions the second a match kicks off. Falsification is impossible." },
              { icon: Wallet, title: "Wallet Ledger", desc: "Your balance is computed solely as the sum of confirmed ledger transactions. No arbitrary balance edits." },
              { icon: Eye, title: "Winner Review Queue", desc: "All completed streaks are routed to the admin review queue for fingerprint and IP logs auditing." },
              { icon: ShieldAlert, title: "Admin Fraud Console", desc: "Admins monitor shared fingerprints, IP addresses, and referral self-abuse patterns in real-time." }
            ].map((sec, i) => {
              const Icon = sec.icon;
              return (
                <GlassCard key={i} className={styles.securityCard} hoverEffect={true}>
                  <Icon className={styles.securityIcon} />
                  <h3 className={styles.securityCardTitle}>{sec.title}</h3>
                  <p className={styles.securityCardDesc}>{sec.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* 5. CHALLENGE TIERS */}
        <section className={styles.pricingSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionSubtitleLabel}>CHALLENGE TIERS</div>
            <h2 className={styles.sectionTitle}>Select Your Streak Tier</h2>
            <p className={styles.sectionSubtitle}>
              Unlock higher pools and priority payouts. Complete a 3-match streak to win exactly 10X your entry fee.
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
                    <span>Streak: 3 predictions per round</span>
                  </li>
                  <li className={styles.perkItem}>
                    <Check size={16} className={styles.perkCheck} />
                    <span>Referral Credit: ₦1,000 per qualified friend</span>
                  </li>
                  {tier.perks?.priority && (
                    <li className={styles.perkItem}>
                      <Check size={16} className={styles.perkCheck} />
                      <span>Priority Payout Audit Queue</span>
                    </li>
                  )}
                  {tier.perks?.elite_badge && (
                    <li className={styles.perkItem}>
                      <Check size={16} className={styles.perkCheck} />
                      <span>Elite profile badges & status</span>
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

        {/* 6. WINNER REVIEW / AUDIT FLOW */}
        <section className={styles.auditFlowSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionSubtitleLabel}>AUDIT GATEWAYS</div>
            <h2 className={styles.sectionTitle}>Winner Verification Flow</h2>
            <p className={styles.sectionSubtitle}>
              How we maintain absolute fairness and credibility in pool reward releases.
            </p>
          </div>

          <div className={styles.flowGrid}>
            {[
              { step: "1", title: "Streak Completed", desc: "User correctly predicts all 3 matchday outcomes." },
              { step: "2", title: "Review Queue Placement", desc: "Entry is automatically routed to the pending winners list (verified = false)." },
              { step: "3", title: "Security Log Audit", desc: "Admin reviews device fingerprints, IP overlaps, and phone OTP status." },
              { step: "4", title: "Ledger Credit", desc: "Admin approves payout. Wallet balance is updated and ledger transaction is committed." }
            ].map((flow, i) => (
              <div key={i} className={styles.flowItem}>
                <div className={styles.flowStepBadge}>{flow.step}</div>
                <h4 className={styles.flowTitle}>{flow.title}</h4>
                <p className={styles.flowDesc}>{flow.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. REFERRAL PROTECTION */}
        <section className={styles.referralsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionSubtitleLabel}>NETWORK EXPANSION</div>
            <h2 className={styles.sectionTitle}>Referral Network Protection</h2>
            <p className={styles.sectionSubtitle}>
              Earn ₦1,000 for every friend who joins. Self-referrals are blocked automatically at database level.
            </p>
          </div>

          <div className={styles.refGrid}>
            <GlassCard className={styles.refInfoCard} hoverEffect={false}>
              <h3>Referral Rules & Safeguards</h3>
              <ul className={styles.refRulesList}>
                <li>Referral reward is ₦1,000 paid to your wallet ledger.</li>
                <li>Friend must complete phone OTP verification, buy a tier, and submit picks.</li>
                <li><strong>Self-Referral Block:</strong> If a referrer and referee share an IP address, device fingerprint, or bank account, the transaction is flagged and both accounts are suspended.</li>
              </ul>
            </GlassCard>
          </div>
        </section>

        {/* 8. FINAL CTA */}
        <section className={styles.ctaSection}>
          <GlassCard className={styles.ctaCard} accent={true}>
            <h2 className={styles.ctaTitle}>Enter the Prediction Arena</h2>
            <p className={styles.ctaDesc}>
              Join the premium football streak challenge. Claim verified rewards on our secure ledger.
            </p>
            <Link href="/arena" className="btn-premium">
              <span>Start Playing Now</span>
              <ChevronRight size={18} />
            </Link>
          </GlassCard>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.footerLogo}>
              NANO<span className={styles.accent}>PLAY</span>
            </div>
            <p className={styles.footerCopyright}>
              &copy; {new Date().getFullYear()} NanoPlay. Premium sports-tech platform. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
