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
                <span className={styles.heroBadge}>WALLET PROTECTED</span>
              </div>
              
              <h1 className={styles.heroTitle}>
                COMMAND<br />
                THE <span className={styles.heroTitleAccent}>PITCH.</span>
              </h1>
              
              <p className={styles.heroSubtitleLine}>
                Build your streak. Win verified rewards.
              </p>
              
              <p className={styles.heroSubtitle}>
                NanoPlay is a premium football challenge arena. Make your picks before kickoff, build your streak, and qualify for verified rewards after review.
              </p>
              
              <div className={styles.heroCta}>
                <Link href="/signup" className="btn-premium">
                  <span>JOIN ARENA ↗</span>
                </Link>
                <Link href="#how-it-works" className="btn-glass">
                  SEE HOW IT WORKS
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
                  <div className={styles.terminalTitle}>NANOPLAY ARENA DASHBOARD</div>
                  <div className={styles.terminalStatus}>
                    <span className={styles.terminalPulse}></span>
                    <span>SECURE RECORDS</span>
                  </div>
                </div>

                <div className={styles.terminalContent}>
                  {/* Top Stats Banner */}
                  <div className={styles.terminalStats}>
                    <div className={styles.termStatChip}>
                      <span className={styles.termStatLabel}>WALLET BALANCE</span>
                      <span className={styles.termStatVal}>₦60,000</span>
                    </div>
                    <div className={styles.termStatChip}>
                      <span className={styles.termStatLabel}>ACTIVE STREAK</span>
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
                    <span className={styles.logMeta}>[SYSTEM RECORDS]</span>
                    <div className={styles.logLine}>&gt; Phone verification check: OK</div>
                    <div className={styles.logLine}>&gt; Kickoff validation check: locked</div>
                    <div className={styles.logLine} style={{ color: "var(--accent-gold)" }}>&gt; Reward status: active</div>
                  </div>
                </div>
              </div>

              {/* Floating Chips */}
              <div className={[styles.floatingChip, styles.chip1].join(" ")}>PICK LOCKED</div>
              <div className={[styles.floatingChip, styles.chip2].join(" ")}>WALLET PROTECTED</div>
              <div className={[styles.floatingChip, styles.chip3].join(" ")}>WINNER REVIEW</div>
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
                <span className={styles.trustDesc}>Live Arena</span>
              </div>
            </div>
            <div className={styles.trustStripItem}>
              <Eye size={18} className={styles.trustIcon} />
              <div className={styles.trustLabel}>
                <span className={styles.trustDesc}>Manual Reward Review</span>
              </div>
            </div>
            <div className={styles.trustStripItem}>
              <Wallet size={18} className={styles.trustIcon} />
              <div className={styles.trustLabel}>
                <span className={styles.trustDesc}>Secure Wallet History</span>
              </div>
            </div>
            <div className={styles.trustStripItem}>
              <ShieldCheck size={18} className={styles.trustIcon} />
              <div className={styles.trustLabel}>
                <span className={styles.trustDesc}>Verified Access</span>
              </div>
            </div>
          </div>
        </section>

        {/* MATCHDAY READY STRIP */}
        <section className={styles.matchdayReadySection}>
          <div className={styles.matchdayContainer}>
            <h3 className={styles.matchdayTitle}>MATCHDAY READY</h3>
            <div className={styles.matchdayGrid}>
              <div className={styles.matchdayItem}>
                <span className={styles.matchdayStep}>1</span>
                <span className={styles.matchdayText}>Choose your tier</span>
              </div>
              <div className={styles.matchdayItem}>
                <span className={styles.matchdayStep}>2</span>
                <span className={styles.matchdayText}>Lock your picks</span>
              </div>
              <div className={styles.matchdayItem}>
                <span className={styles.matchdayStep}>3</span>
                <span className={styles.matchdayText}>Watch the games</span>
              </div>
              <div className={styles.matchdayItem}>
                <span className={styles.matchdayStep}>4</span>
                <span className={styles.matchdayText}>Track your streak</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW NANOPLAY WORKS */}
        <section id="how-it-works" className={styles.howItWorksSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionSubtitleLabel}>STEP-BY-STEP ARENA</div>
            <h2 className={styles.sectionTitle}>
              How <span className={styles.editorialItalicTitle}>NanoPlay</span> Works
            </h2>
            <p className={styles.sectionSubtitle}>
              Predict matches, build streaks, and qualify for verified rewards securely.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {[
              { num: "1", title: "Choose Your Tier", desc: "Pick the challenge level you want." },
              { num: "2", title: "Make Your Picks", desc: "Predict match outcomes before kickoff." },
              { num: "3", title: "Build Your Streak", desc: "Get your picks right and keep your streak alive." },
              { num: "4", title: "Get Reviewed", desc: "Winning streaks are checked before rewards are credited." }
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
            <div className={styles.sectionSubtitleLabel}>SIMPLE RULES</div>
            <h2 className={styles.sectionTitle}>
              Fair Play, <span className={styles.editorialItalicTitle}>Simple Rules</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              We keep the arena fair with phone verification, locked picks, wallet history, and reward review.
            </p>
          </div>

          <div className={styles.securityGrid}>
            {[
              { label: "One phone number per account", title: "One Phone, One Account", desc: "Helps keep the arena fair and prevents duplicate accounts." },
              { label: "Picks lock before kickoff", title: "Pick Lock", desc: "Your picks lock before kickoff, so nobody can change selections after a match starts." },
              { label: "Wallet history is recorded", title: "Wallet History", desc: "Every wallet movement is recorded clearly for transparency." },
              { label: "Winners are reviewed", title: "Winner Review", desc: "Winning streaks are checked before rewards are credited." },
              { label: "Shared bank details are flagged", title: "Account Safety Check", desc: "Shared bank details or suspicious activity can be flagged for review." },
              { label: "Admins review suspicious activity", title: "Fair-Play Monitoring", desc: "Admins can restrict accounts that break the rules." }
            ].map((sec, i) => {
              return (
                <div key={i} className={styles.securityCard}>
                  <div className={styles.securityCardHeader}>
                    <span className={styles.securityCmd}>{sec.label}</span>
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
            <h2 className={styles.ctaTitle}>Ready for Matchday?</h2>
            <p className={styles.ctaDesc}>
              Make your picks before kickoff and build your streak.
            </p>
            <Link href="/signup" className="btn-premium">
              <span>JOIN ARENA ↗</span>
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
                  <li><span className={styles.footerComingSoon}>Community Channels: Coming Soon</span></li>
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
                <span className={styles.footerBottomBadge}>Verified Platform</span>
                <span className={styles.footerBottomBadge}>Wallet Records Protected</span>
                <span className={styles.footerBottomBadge}>Fair-Play Monitoring</span>
                <span className={styles.footerBottomBadge}>Manual Reward Review</span>
              </div>
            </div>

          </div>
        </footer>
      </main>
    </>
  );
}
