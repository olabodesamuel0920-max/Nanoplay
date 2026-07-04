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
  const [expanded, setExpanded] = React.useState(false);
  return (
    <>
      <Navbar />
      <main className={`${styles.main} main-with-bottom-nav relative`}>
        {/* Mobile atmosphere — lightweight CSS only */}
        <div className="mobile-hero-glow mobile-only" aria-hidden="true" />
        <div className="mobile-stadium-lights mobile-only" aria-hidden="true" />
        <div className="mobile-pitch-floor mobile-only" aria-hidden="true" />
        
        {/* Live Match Ticker Strip */}
        {/* Desktop: animated marquee */}
        <div className="desktop-only overflow-hidden py-3" style={{ overflow: 'hidden', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
          <div className="animate-marquee whitespace-nowrap" style={{ display: 'flex', width: 'max-content' }}>
            <span style={{ margin: '0 24px', fontSize: '14px', fontWeight: 'bold', color: '#D4A853', display: 'inline-block' }}>🔥 ARENA ACTIVE</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Streak Competitions</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-secondary)', display: 'inline-block' }}>•</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Verified Picks</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-secondary)', display: 'inline-block' }}>•</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Wallet Protected</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-secondary)', display: 'inline-block' }}>•</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Manual Payout Review</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-secondary)', display: 'inline-block' }}>•</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Fair Play Checking</span>
            
            <span style={{ margin: '0 24px', fontSize: '14px', fontWeight: 'bold', color: '#D4A853', display: 'inline-block' }}>🔥 ARENA ACTIVE</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Streak Competitions</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-secondary)', display: 'inline-block' }}>•</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Verified Picks</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-secondary)', display: 'inline-block' }}>•</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Wallet Protected</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-secondary)', display: 'inline-block' }}>•</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Manual Payout Review</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-secondary)', display: 'inline-block' }}>•</span>
            <span style={{ margin: '0 24px', fontSize: '14px', color: 'var(--foreground-primary)', display: 'inline-block' }}>Fair Play Checking</span>
          </div>
        </div>

        {/* Mobile ticker */}
        <div className="mobile-only py-3 border-y" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
          <div className="flex items-center justify-center gap-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span className="relative flex h-2 w-2" style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#4ade80', opacity: 0.75 }} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: '#22c55e' }} />
            </span>
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider" style={{ fontSize: '12px', fontWeight: 'bold', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Arena Active</span>
            <span className="text-xs text-[var(--foreground-muted)]">|</span>
            <span className="text-xs text-[var(--foreground-secondary)]" style={{ fontSize: '12px' }}>Verified Picks Only</span>
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
              {/* Desktop Only Badges */}
              <div className={`${styles.desktopFlex} flex-wrap gap-2 mb-6`} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                <span className={styles.heroBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}><span className={styles.pulseDot} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', display: 'inline-block', marginRight: '4px' }}></span>LIVE ARENA ACTIVE</span>
                <span className={styles.heroBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>VERIFIED PICKS</span>
                <span className={styles.heroBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>WALLET PROTECTED</span>
              </div>
              
              {/* Mobile Hero Headline (Part 2B) */}
              <div className={`${styles.mobileOnly} w-full mb-6`}>
                <h1 className="text-[26px] leading-[1.15] font-bold text-center px-4" style={{ fontSize: '26px', lineHeight: '1.15', fontWeight: 'bold', color: 'var(--foreground-primary)', textAlign: 'center', padding: '0 16px' }}>
                  Predict Match Outcomes.<br />
                  <span className="text-[#D4A853]">Build Your Streak.</span>
                </h1>
                <p className="text-sm text-center px-6 mt-3" style={{ fontSize: '14px', color: 'var(--foreground-secondary)', textAlign: 'center', padding: '0 24px', marginTop: '12px' }}>
                  Join football prediction challenges, lock your selections before kickoff and qualify for listed rewards after review.
                </p>
              </div>

              {/* Desktop Hero Title */}
              <h1 className={`${styles.heroTitle} ${styles.desktopOnly}`}>
                <span className={styles.heroTitleAccent}>Predict</span> Match Outcomes.<br />
                <span className={styles.heroTitleAccent}>Build</span> Your Streak.
              </h1>
              
              {/* Desktop Hero Subtitle Line */}
              <p className={`${styles.heroSubtitleLine} ${styles.desktopOnly}`}>
                Join football prediction challenges, lock your selections before kickoff and qualify for listed rewards after review.
              </p>
              
              {/* Desktop Hero Subtitle Description */}
              <p className={`${styles.heroSubtitle} ${styles.desktopOnly}`}>
                NanoPlay is a premium football challenge arena. Make your picks before kickoff, build your streak, and qualify for listed rewards after review.
              </p>
              
              {/* Desktop Hero CTAs */}
              <div className={`${styles.heroCta} ${styles.desktopFlex}`}>
                <Link href="/signup" className="btn-premium">
                  <span>Start Your First Challenge ↗</span>
                </Link>
                <Link href="#how-it-works" className="btn-glass">
                  SEE HOW IT WORKS
                </Link>
              </div>
            </div>

            {/* Right Side: Stadium Arena Stage — Matchday Board (Part 2) */}
            <div className={styles.heroRight}>
              
              {/* Desktop Matchday Board */}
              <div className={styles.desktopOnly}>
                <div className="relative rounded-2xl p-6 md:p-8 bg-[#0b0b0e] border border-[#D4A853]/30 overflow-hidden max-w-md mx-auto" style={{ position: 'relative', borderRadius: '16px', padding: '24px', backgroundColor: '#0b0b0e', border: '1px solid rgba(212, 168, 83, 0.3)', overflow: 'hidden', maxWidth: '28rem', margin: '0 auto' }}>
                  {/* Permanent ambient glow */}
                  <div className="absolute inset-0 bg-[#D4A853]/5 pointer-events-none" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(212, 168, 83, 0.05)', pointerEvents: 'none' }} />
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#D4A853]/10 rounded-full blur-3xl pointer-events-none" style={{ position: 'absolute', top: '-80px', right: '-80px', width: '160px', height: '160px', backgroundColor: 'rgba(212, 168, 83, 0.1)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
                  
                  {/* Header */}
                  <div className="relative z-10 flex justify-between items-center mb-6" style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="w-2 h-2 rounded-full bg-[#D4A853] animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D4A853', display: 'inline-block' }} />
                      <span className="text-xs font-bold text-[#D4A853] uppercase tracking-wider" style={{ fontSize: '12px', fontWeight: 'bold', color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matchday Preview</span>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20 font-medium" style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'rgba(212, 168, 83, 0.1)', color: '#D4A853', border: '1px solid rgba(212, 168, 83, 0.2)', fontWeight: 500 }}>
                      Preview Mode
                    </span>
                  </div>
                  
                  {/* Teams & Score */}
                  <div className="relative z-10 flex items-center justify-between mb-6" style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div className="text-center flex-1" style={{ textAlign: 'center', flex: 1 }}>
                      <p className="text-sm md:text-base font-bold text-white mb-2" style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>Team Alpha</p>
                      <div className="w-12 h-12 mx-auto rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center" style={{ width: '48px', height: '48px', margin: '0 auto', borderRadius: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-xl font-mono font-bold text-white" style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff' }}>—</span>
                      </div>
                    </div>
                    
                    <div className="px-3 md:px-4 text-center" style={{ padding: '0 16px', textAlign: 'center' }}>
                      <p className="text-xs text-slate-400 mb-1" style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>VS</p>
                      <p className="text-2xl font-mono font-bold text-[#D4A853]" style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', color: '#D4A853' }}>18:00</p>
                      <p className="text-xs text-slate-400 mt-1" style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Today</p>
                    </div>
                    
                    <div className="text-center flex-1" style={{ textAlign: 'center', flex: 1 }}>
                      <p className="text-sm md:text-base font-bold text-white mb-2" style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>Team Omega</p>
                      <div className="w-12 h-12 mx-auto rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center" style={{ width: '48px', height: '48px', margin: '0 auto', borderRadius: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-xl font-mono font-bold text-white" style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff' }}>—</span>
                      </div>
                    </div>
                  </div>

                  {/* Pick Before Kickoff Banner */}
                  <div className="text-center text-[10px] tracking-wider text-[#D4A853] font-bold uppercase mb-4" style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '0.1em', color: '#D4A853', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px' }}>
                    ⚡ PICK BEFORE KICKOFF
                  </div>
                  
                  {/* Prediction Buttons */}
                  <div className="relative z-10 grid grid-cols-3 gap-3 mb-6" style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    <button className="h-14 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D4A853]/50 transition-colors flex flex-col items-center justify-center" style={{ height: '56px', borderRadius: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span className="text-lg font-mono font-bold text-white" style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff' }}>1</span>
                      <span className="text-xs text-slate-400" style={{ fontSize: '12px', color: '#94a3b8' }}>Home</span>
                    </button>
                    <button className="h-14 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D4A853]/50 transition-colors flex flex-col items-center justify-center" style={{ height: '56px', borderRadius: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span className="text-lg font-mono font-bold text-white" style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff' }}>X</span>
                      <span className="text-xs text-slate-400" style={{ fontSize: '12px', color: '#94a3b8' }}>Draw</span>
                    </button>
                    <button className="h-14 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D4A853]/50 transition-colors flex flex-col items-center justify-center" style={{ height: '56px', borderRadius: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span className="text-lg font-mono font-bold text-white" style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff' }}>2</span>
                      <span className="text-xs text-slate-400" style={{ fontSize: '12px', color: '#94a3b8' }}>Away</span>
                    </button>
                  </div>
                  
                  {/* Streak */}
                  <div className="relative z-10 text-center mb-6" style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '24px' }}>
                    <p className="text-sm text-slate-400" style={{ fontSize: '14px', color: '#94a3b8' }}>
                      Streak: <span className="text-[#D4A853] font-mono font-bold" style={{ color: '#D4A853', fontFamily: 'monospace', fontWeight: 'bold' }}>2/3</span> correct
                    </p>
                    <div className="w-full h-2 bg-[#1a1a1a] rounded-full mt-2 overflow-hidden" style={{ width: '100%', height: '8px', backgroundColor: '#1a1a1a', borderRadius: '9999px', marginTop: '8px', overflow: 'hidden' }}>
                      <div className="h-full bg-[#D4A853] rounded-full" style={{ height: '100%', backgroundColor: '#D4A853', borderRadius: '9999px', width: '66%' }} />
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <Link href="/signup" className="relative z-10 w-full h-12 bg-[#D4A853] text-black font-bold rounded-lg hover:bg-[#dfba6b] transition-colors flex items-center justify-center" style={{ display: 'flex', zIndex: 10, width: '100%', height: '48px', backgroundColor: '#D4A853', color: '#000000', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', textDecoration: 'none' }}>
                    Lock Your Pick
                  </Link>
                </div>
              </div>

              {/* Mobile-Optimized Match Card (Part 2C) */}
              <div className={`${styles.mobileOnly} mx-4 rounded-2xl bg-[#0b0b0e] border border-[#D4A853]/30 overflow-hidden relative`} style={{ position: 'relative', borderRadius: '16px', padding: '0', backgroundColor: '#0b0b0e', border: '1px solid rgba(212, 168, 83, 0.3)', overflow: 'hidden', margin: '0 16px' }}>
                {/* Glow */}
                <div className="absolute inset-0 bg-[#D4A853]/5 pointer-events-none" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(212, 168, 83, 0.05)', pointerEvents: 'none' }} />
                <div className="absolute -top-10 right-0 w-32 h-32 bg-[#D4A853]/10 rounded-full blur-2xl pointer-events-none" style={{ position: 'absolute', top: '-40px', right: 0, width: '128px', height: '128px', backgroundColor: 'rgba(212, 168, 83, 0.1)', borderRadius: '50%', filter: 'blur(16px)', pointerEvents: 'none' }} />
                
                <div className="relative z-10 p-5" style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="relative flex h-2 w-2" style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A853]/70 opacity-75" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#D4A853', opacity: 0.75 }} />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A853]" style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: '#D4A853' }} />
                      </span>
                      <span className="text-xs font-bold text-[#D4A853] uppercase" style={{ fontSize: '12px', fontWeight: 'bold', color: '#D4A853', textTransform: 'uppercase' }}>Preview</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20" style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '9999px', backgroundColor: 'rgba(212, 168, 83, 0.1)', color: '#D4A853', border: '1px solid rgba(212, 168, 83, 0.2)' }}>
                      Preview Mode
                    </span>
                  </div>
                  
                  {/* Teams */}
                  <div className="flex items-center justify-between mb-5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div className="text-center flex-1" style={{ textAlign: 'center', flex: 1 }}>
                      <p className="text-sm font-bold text-white mb-2 truncate" style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>Team Alpha</p>
                      <div className="w-10 h-10 mx-auto rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center" style={{ width: '40px', height: '40px', margin: '0 auto', borderRadius: '8px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-lg font-mono font-bold text-slate-500" style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold', color: '#64748b' }}>—</span>
                      </div>
                    </div>
                    
                    <div className="px-3 text-center" style={{ padding: '0 12px', textAlign: 'center' }}>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>VS</p>
                      <p className="text-xl font-mono font-bold text-[#D4A853]" style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold', color: '#D4A853' }}>18:00</p>
                      <p className="text-[10px] text-slate-500 mt-1" style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Today</p>
                    </div>
                    
                    <div className="text-center flex-1" style={{ textAlign: 'center', flex: 1 }}>
                      <p className="text-sm font-bold text-white mb-2 truncate" style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>Team Omega</p>
                      <div className="w-10 h-10 mx-auto rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center" style={{ width: '40px', height: '40px', margin: '0 auto', borderRadius: '8px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-lg font-mono font-bold text-slate-500" style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold', color: '#64748b' }}>—</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Prediction Buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    <button className="h-14 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] active:bg-[#D4A853]/20 active:border-[#D4A853] transition-colors flex flex-col items-center justify-center" style={{ height: '56px', borderRadius: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span className="text-lg font-mono font-bold text-white" style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff' }}>1</span>
                      <span className="text-[10px] text-slate-500" style={{ fontSize: '10px', color: '#64748b' }}>Home</span>
                    </button>
                    <button className="h-14 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] active:bg-[#D4A853]/20 active:border-[#D4A853] transition-colors flex flex-col items-center justify-center" style={{ height: '56px', borderRadius: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span className="text-lg font-mono font-bold text-white" style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff' }}>X</span>
                      <span className="text-[10px] text-slate-500" style={{ fontSize: '10px', color: '#64748b' }}>Draw</span>
                    </button>
                    <button className="h-14 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] active:bg-[#D4A853]/20 active:border-[#D4A853] transition-colors flex flex-col items-center justify-center" style={{ height: '56px', borderRadius: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span className="text-lg font-mono font-bold text-white" style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff' }}>2</span>
                      <span className="text-[10px] text-slate-500" style={{ fontSize: '10px', color: '#64748b' }}>Away</span>
                    </button>
                  </div>
                  
                  {/* Streak */}
                  <div className="mb-4" style={{ marginBottom: '16px' }}>
                    <div className="flex justify-between text-xs mb-2" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span className="text-slate-400" style={{ color: '#94a3b8' }}>Streak</span>
                      <span className="text-[#D4A853] font-mono font-bold" style={{ color: '#D4A853', fontFamily: 'monospace', fontWeight: 'bold' }}>2/3</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden" style={{ width: '100%', height: '6px', backgroundColor: '#1a1a1a', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div className="h-full bg-[#D4A853] rounded-full" style={{ height: '100%', backgroundColor: '#D4A853', borderRadius: '9999px', width: '66%' }} />
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <Link href="/signup" className="w-full h-12 bg-[#D4A853] text-black font-bold rounded-lg text-sm flex items-center justify-center" style={{ display: 'flex', width: '100%', height: '48px', backgroundColor: '#D4A853', color: '#000000', fontWeight: 'bold', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', cursor: 'pointer' }}>
                    Lock Your Pick
                  </Link>
                </div>
              </div>
              
              <div className={styles.stadiumFloor}></div>
            </div>

          </div>
        </section>

        {/* Trust Banner (PART 9) */}
        {/* Desktop Trust Banner */}
        <div className={`${styles.desktopOnly} py-4 px-6 border-y relative z-10`} style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', padding: '16px 24px' }}>
          <p className="text-center text-xs max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)', fontSize: '12px', lineHeight: '1.6', margin: '0 auto', textAlign: 'center' }}>
            NanoPlay is a football prediction challenge platform. Not betting. Not gambling. 
            Predictions are for entertainment. Rewards are subject to manual review and verification.
            All players must be 18+. Play responsibly.
          </p>
        </div>

        {/* Mobile Collapsible Trust Banner */}
        <div className={`${styles.mobileOnly} mx-4 mt-4 p-3 rounded-xl`} style={{ margin: '16px 16px 0 16px', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
          <p className={`text-[11px] text-center leading-relaxed ${expanded ? "" : "line-clamp-2"}`} style={{ fontSize: '11px', color: 'var(--foreground-muted)', textAlign: 'center', lineHeight: '1.625' }}>
            NanoPlay is a football prediction challenge platform. Not betting. Not gambling. 
            Predictions are for entertainment. Rewards are subject to manual review and verification.
            All players must be 18+. Play responsibly.
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="block mx-auto mt-2 text-xs text-[#D4A853] hover:underline"
            style={{
              display: 'block',
              margin: '8px auto 0 auto',
              fontSize: '11px',
              color: '#D4A853',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        </div>

        {/* How It Works section */}
        {/* Desktop How It Works */}
        <section className={`${styles.howItWorksSection} ${styles.desktopOnly}`}>
          <div className="section-label" style={{ display: 'block', textAlign: 'center', marginBottom: '1rem' }}>How NanoPlay Works</div>
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: 'var(--foreground-primary)', fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}>
            How NanoPlay Works
          </h2>
          <div className={styles.stepsGrid}>
            {[
              { num: "1", title: "Pick Your Matches", desc: "Choose from upcoming football fixtures every matchday.", icon: "⚽" },
              { num: "2", title: "Build Your Streak", desc: "Correct predictions earn points. Longer streaks qualify for rewards.", icon: "🔥" },
              { num: "3", title: "Qualify for Rewards", desc: "Top predictors earn verified payouts after manual review.", icon: "🏆" },
            ].map((item) => (
              <div key={item.title} className={styles.stepCard}>
                <div className={styles.stepNum}>{item.num}</div>
                <div className="text-4xl mb-4" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{item.icon}</div>
                <h3 className="text-lg font-bold mb-3" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{item.title}</h3>
                <p className="text-sm" style={{ fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile How It Works */}
        <div className={`${styles.mobileOnly} px-4 mt-8`} style={{ padding: '0 16px', marginTop: '32px' }}>
          <p className="text-xs font-bold text-[#D4A853] uppercase tracking-wider mb-4 text-center" style={{ fontSize: '12px', fontWeight: 'bold', color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', textAlign: 'center' }}>
            How It Works
          </p>
          <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: "⚽", title: "Pick Matches", desc: "Choose fixtures every matchday" },
              { icon: "🔥", title: "Build Streak", desc: "Correct picks earn points" },
              { icon: "🏆", title: "Win Rewards", desc: "Top predictors get verified payouts" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#0b0b0e] border border-[#1a1a1a]" style={{ display: 'flex', alignItems: 'start', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: '#0b0b0e', border: '1px solid #1a1a1a' }}>
                <span className="text-xl shrink-0" style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white" style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5" style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#D4A853]/20 to-transparent my-12 md:my-16" />

        {/* 2. OPERATIONAL TRUST STRIP / Trust section (PART 6) */}
        {/* Desktop Trust Strip */}
        <section className={`${styles.trustStrip} ${styles.desktopOnly}`} style={{ display: 'block', padding: '2rem 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto 2rem auto', padding: '0 24px' }}>
            <div className="section-label">Trust & Security</div>
            <h2 className="text-3xl font-bold mb-6 text-white" style={{ color: 'var(--foreground-primary)', fontSize: '2rem', marginBottom: '1.5rem' }}>
              Elite Trust & Security Layer
            </h2>
          </div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { title: "One Phone, One Account", desc: "Prevents duplicate accounts and keeps the arena fair.", icon: "📱" },
                { title: "Pick Lock", desc: "Your picks freeze before kickoff. No changes after the whistle.", icon: "🔒" },
                { title: "Wallet History", desc: "Every transaction recorded for full transparency.", icon: "📊" },
                { title: "Winner Review", desc: "All winning streaks verified manually before payout.", icon: "✓" },
                { title: "Account Safety", desc: "Suspicious activity flagged and reviewed by admins.", icon: "🛡️" },
                { title: "Fair-Play Monitoring", desc: "Rule-breakers are restricted to protect honest players.", icon: "⚖️" },
              ].map((item) => (
                <div key={item.title} className="glass-card rounded-xl p-5" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-card)' }}>
                  <div className="text-2xl mb-3" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{item.icon}</div>
                  <h3 className="text-sm font-bold mb-2" style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--foreground-primary)', marginBottom: '8px' }}>{item.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ fontSize: '12px', color: 'var(--foreground-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="pitch-texture"></div>
        </section>

        {/* Mobile Trust Grid (PART 6) */}
        <div className={`${styles.mobileOnly} px-4 mt-8`} style={{ padding: '0 16px', marginTop: '32px' }}>
          <p className="text-xs font-bold text-[#D4A853] uppercase tracking-wider mb-4 text-center" style={{ fontSize: '12px', fontWeight: 'bold', color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', textAlign: 'center' }}>
            Trust & Security
          </p>
          <div className="grid grid-cols-2 gap-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { icon: "🔒", title: "Pick Lock", desc: "Picks freeze before kickoff" },
              { icon: "📊", title: "Transparent", desc: "All transactions recorded" },
              { icon: "✓", title: "Verified", desc: "Manual winner review" },
              { icon: "🛡️", title: "Secure", desc: "Account safety checks" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl text-center" style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                <span className="text-lg" style={{ fontSize: '18px' }}>{item.icon}</span>
                <p className="text-xs font-bold mt-1" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--foreground-primary)', marginTop: '4px' }}>{item.title}</p>
                <p className="text-[10px] mt-0.5" style={{ fontSize: '10px', color: 'var(--foreground-muted)', marginTop: '2px' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#D4A853]/20 to-transparent my-12 md:my-16" />

        {/* MATCHDAY READY STEPS (PART 4) */}
        {/* Desktop Matchday Ready */}
        <section className={`${styles.matchdayReadySection} ${styles.desktopOnly}`} style={{ padding: '3rem 0' }}>
          <div className="max-w-[1240px] mx-auto px-8" style={{ maxWidth: '1240px', padding: '0 32px', margin: '0 auto' }}>
            <div className="section-label" style={{ marginBottom: '1.5rem' }}>Matchday Ready</div>
            <h3 className="text-2xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 900, color: 'var(--accent-gold)', marginBottom: '2rem' }}>MATCHDAY READY</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { num: "1", title: "Choose Your Tier", desc: "Pick the challenge level you want." },
                { num: "2", title: "Lock Your Picks", desc: "Predict match outcomes before kickoff." },
                { num: "3", title: "Watch the Games", desc: "Follow the action live." },
                { num: "4", title: "Track Your Streak", desc: "Get your picks right and keep your streak alive." },
              ].map((step) => (
                <div key={step.num} className="text-center md:text-left" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="flex items-center gap-3 mb-3 justify-center md:justify-start" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span className="w-10 h-10 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center text-[#D4A853] font-mono font-bold text-lg" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212, 168, 83, 0.1)', border: '1px solid rgba(212, 168, 83, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A853', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', lineHeight: '40px' }}>
                      {step.num}
                    </span>
                    <h3 className="text-base font-bold" style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--foreground-primary)' }}>{step.title}</h3>
                  </div>
                  <p className="text-sm pl-0 md:pl-[52px]" style={{ fontSize: '14px', color: 'var(--foreground-secondary)', lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Horizontal scroll steps (PART 4G) */}
        <div className={`${styles.mobileOnly} px-4 mt-8 overflow-x-auto pb-4 scroll-smooth-ios`} style={{ overflowX: 'auto', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
          <p className="text-xs font-bold text-[#D4A853] uppercase tracking-wider mb-4 text-center" style={{ fontSize: '12px', fontWeight: 'bold', color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', textAlign: 'center' }}>
            Matchday Ready
          </p>
          <div className="flex gap-3" style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
            {[
              { num: "1", title: "Choose Tier", desc: "Pick your challenge level" },
              { num: "2", title: "Lock Picks", desc: "Predict before kickoff" },
              { num: "3", title: "Watch Live", desc: "Follow the action" },
              { num: "4", title: "Track Streak", desc: "Build your record" },
            ].map((step) => (
              <div key={step.num} className="w-[140px] shrink-0 p-4 rounded-xl text-center" style={{ width: '140px', flexShrink: 0, padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                <div className="w-8 h-8 mx-auto rounded-full bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center text-[#D4A853] font-mono font-bold text-sm mb-2" style={{ width: '32px', height: '32px', margin: '0 auto 8px auto', borderRadius: '50%', backgroundColor: 'rgba(212, 168, 83, 0.1)', border: '1px solid rgba(212, 168, 83, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A853', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>
                  {step.num}
                </div>
                <p className="text-xs font-bold mb-1" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--foreground-primary)', marginBottom: '4px' }}>{step.title}</p>
                <p className="text-[10px]" style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#D4A853]/20 to-transparent my-12 md:my-16" />

        {/* 5. FINAL CTA (with value prop context) */}
        {/* Desktop CTA */}
        <section className={`${styles.ctaSection} ${styles.desktopOnly}`}>
          <div className="section-label" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>Challenge Pass</div>
          <GlassCard className={styles.ctaCard} accent={true} hoverEffect={false}>
            <h2 className={styles.ctaTitle}>Ready to Claim Your Place?</h2>
            <p className={styles.ctaDesc} style={{ marginBottom: '24px' }}>
              Create your account now to access the live prediction matches, verify your phone status, lock your predictions, and start building your winning streak today.
            </p>
            <Link href="/signup" className="btn-premium">
              <span>Join Arena ↗</span>
            </Link>
          </GlassCard>
        </section>

        {/* Mobile Footer CTA */}
        <div className={`${styles.mobileOnly} px-4 py-8 text-center`} style={{ padding: '32px 16px', textAlign: 'center' }}>
          <p className="text-lg font-bold mb-2" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--foreground-primary)', marginBottom: '8px' }}>Ready for Matchday?</p>
          <p className="text-sm mb-4" style={{ fontSize: '14px', color: 'var(--foreground-secondary)', marginBottom: '16px' }}>Join the prediction challenge now</p>
          <Link href="/signup" className="w-full h-14 bg-[#D4A853] text-black font-bold rounded-xl text-base flex items-center justify-center" style={{ display: 'flex', width: '100%', height: '56px', backgroundColor: '#D4A853', color: '#000000', fontWeight: 'bold', borderRadius: '12px', fontSize: '16px', textDecoration: 'none', cursor: 'pointer' }}>
            Join Arena ↗
          </Link>
          <p className="text-[10px] mt-3" style={{ fontSize: '10px', color: 'var(--foreground-muted)', marginTop: '12px' }}>
            Free to join • ₦500 challenge pass • Listed rewards
          </p>
        </div>

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
