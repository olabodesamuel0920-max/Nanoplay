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
  Activity,
  Check,
  Clock,
  Target,
  Zap,
  Trophy
} from "lucide-react";
import styles from "./page.module.css";
import AtmosphereLayer from "@/components/AtmosphereLayer";

const TICKER_MATCHES = [
  { id: 1, home: "Lagos XI", away: "Abuja XI", status: "LIVE", time: "74'", score: "2 - 1" },
  { id: 2, home: "Kano Stars", away: "PH City FC", status: "18:00", date: "TODAY" },
  { id: 3, home: "Kaduna Utd", away: "Ibadan Warriors", status: "20:30", date: "TODAY" },
  { id: 4, home: "Enugu Rangers", away: "Bendel Insurance", status: "16:00", date: "TOMORROW" },
  { id: 5, home: "Calabar Rovers", away: "Warri Wolves", status: "FINISHED", score: "0 - 1" },
  { id: 6, home: "Plateau Utd", away: "Enyimba FC", status: "LIVE", time: "12'", score: "0 - 0" }
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Live Match Ticker Strip */}
        <div className={styles.tickerStrip} aria-hidden="true">
          <div className={styles.tickerTrack}>
            {[...TICKER_MATCHES, ...TICKER_MATCHES].map((match, idx) => (
              <div key={`${match.id}-${idx}`} className={styles.tickerItem}>
                <span className={styles.tickerTeam}>{match.home}</span>
                {match.score ? (
                  <span className={styles.tickerScore}>{match.score}</span>
                ) : (
                  <span className={styles.tickerVs}>vs</span>
                )}
                <span className={styles.tickerTeam}>{match.away}</span>
                <span className={[
                  styles.tickerStatus,
                  match.status === "LIVE" ? styles.statusLive : ""
                ].join(" ")}>
                  {match.status === "LIVE" && <span className={styles.tickerPulse} />}
                  {match.status} {match.time && `(${match.time})`}
                </span>
              </div>
            ))}
          </div>
        </div>


        {/* Sportsbook-inspired Category Navigation Bar */}
        <div className={styles.categoryBar} aria-label="Sports & Challenges Navigation">
          <div className={styles.categoryContainer}>
            <button className={`${styles.categoryTab} ${styles.categoryTabActive}`}>
              <span className={styles.categoryIcon}>⚽</span>
              <span>Football Arena</span>
            </button>
            <button className={styles.categoryTab}>
              <span className={styles.categoryIcon}>⚡</span>
              <span>Active Predictions</span>
            </button>
            <button className={styles.categoryTab}>
              <span className={styles.categoryIcon}>📅</span>
              <span>Today&apos;s Fixtures</span>
            </button>
            <button className={styles.categoryTab}>
              <span className={styles.categoryIcon}>🏆</span>
              <span>Champions Streak</span>
            </button>
            <button className={styles.categoryTab}>
              <span className={styles.categoryIcon}>📖</span>
              <span>Challenge Rules</span>
            </button>
          </div>
        </div>

        <AtmosphereLayer variant="hero" />
        {/* Glow Spotlights */}
        <div className={styles.glowTop}></div>
        <div className={styles.glowMid}></div>

        {/* 1. HERO SECTION */}
        <section className={`${styles.heroSection} sports-stadium-lights`}>
          <div className={styles.heroGrid}>
            
            {/* Left Side: Editorial Typography & Copy */}
            <div className={styles.heroLeft}>
              <div className={styles.badgeRow}>
                <span className={styles.heroBadge}><span className={styles.pulseDot}></span>LIVE ARENA ACTIVE</span>
                <span className={styles.heroBadge}>VERIFIED PICKS</span>
                <span className={styles.heroBadge}>WALLET PROTECTED</span>
              </div>
              
              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleAccent}>Predict</span> Football Matches.<br />
                <span className={styles.heroTitleAccent}>Win</span> Verified Rewards.
              </h1>
              
              <p className={styles.heroSubtitleLine}>
                Join matchday challenges. Build your prediction streak. Earn real rewards.
              </p>
              
              <p className={styles.heroSubtitle}>
                NanoPlay is a premium football challenge arena. Make your picks before kickoff, build your streak, and qualify for verified rewards after review.
              </p>
              
              <div className={styles.heroCta}>
                <Link href="/signup" className="btn-premium">
                  <span>Start Your First Challenge ↗</span>
                </Link>
                <Link href="#how-it-works" className="btn-glass">
                  SEE HOW IT WORKS
                </Link>
              </div>

              <p className="text-sm text-slate-400 mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                2,400+ players competing this matchday
              </p>
            </div>

            {/* Right Side: Stadium Arena Stage — Matchday Board */}
            <div className={styles.heroRight}>
              <div className={styles.boardGlow}></div>

              {/* Central Matchday Board */}
              <div className={styles.matchdayBoard}>
                {/* Board Header */}
                <div className={styles.boardHeader}>
                  <div className={styles.boardHeaderLeft}>
                    <span className={styles.boardPulseDot}></span>
                    <span className={styles.boardHeaderTitle}>UPCOMING MATCHDAY</span>
                  </div>
                  <div className={styles.boardStatusChip}>
                    <span>Starts in 2d 14h</span>
                  </div>
                </div>

                {/* Board Content */}
                <div className={styles.boardContent}>
                  {/* Featured Match */}
                  <div className={styles.featuredMatch}>
                    <div className={styles.featuredTeam}>
                      <span className={styles.teamName}>Arsenal</span>
                    </div>
                    <div className={styles.featuredVsBlock}>
                      <span className={styles.featuredVs}>VS</span>
                    </div>
                    <div className={styles.featuredTeam}>
                      <span className={styles.teamName}>Liverpool</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Link href="/signup" className="btn-premium py-2 px-4 text-xs font-semibold uppercase tracking-wider">
                      Predict Now
                    </Link>
                  </div>
                </div>
              </div>

              {/* Stadium Floor / Pitch Platform */}
              <div className={styles.stadiumFloor}></div>
            </div>

          </div>
        </section>

        {/* Trust Banner (PART 9) */}
        <div className="py-4 px-4 border-y border-gold/10 bg-charcoal/50 relative z-10" style={{ borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-charcoal)' }}>
          <p className="text-center text-xs max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            NanoPlay is a football prediction challenge platform. Not betting. Not gambling. 
            Predictions are for entertainment. Rewards are subject to manual review and verification.
          </p>
        </div>

        {/* What is NanoPlay? / How NanoPlay Works section (PART 1 - 7) */}
        <section className="py-16 px-4 relative z-10" style={{ paddingTop: '4rem', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
          <div style={{ maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground-primary)', fontSize: '1.5rem', marginBottom: '2rem' }}>
              How NanoPlay Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'rgba(214, 162, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Target style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-gold)' }} />
                </div>
                <h3 style={{ color: 'var(--foreground-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Pick Your Matches</h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Choose from upcoming football fixtures every matchday.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'rgba(214, 162, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Zap style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-gold)' }} />
                </div>
                <h3 style={{ color: 'var(--foreground-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Build Your Streak</h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Correct predictions earn points. Longer streaks = bigger rewards.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'rgba(214, 162, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Trophy style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-gold)' }} />
                </div>
                <h3 style={{ color: 'var(--foreground-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Win Real Rewards</h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Top predictors earn verified payouts. Fair, transparent, fast.</p>
              </div>
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
                  An elite premium football challenge platform built for fair play, fair wallet records, and streak competitions.
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
              <div>
                <p className={styles.footerCopyright}>
                  &copy; {new Date().getFullYear()} NanoPlay. All rights reserved.
                </p>
                <p style={{ fontSize: "11px", color: "var(--foreground-muted)", marginTop: "8px", maxWidth: "800px", lineHeight: "1.5" }}>
                  Disclaimer: NanoPlay is an independent sports prediction challenge platform. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with FIFA, UEFA, Champions League, Premier League, or any football clubs or players. All team names and match information are generic representations used strictly for gameplay description.
                </p>
              </div>
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
