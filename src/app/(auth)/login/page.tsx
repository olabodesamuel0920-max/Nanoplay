// src/app/(auth)/login/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GlassCard from "@/components/ui/glass-card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { Trophy, ShieldCheck, HelpCircle } from "lucide-react";
import styles from "./page.module.css";
import AtmosphereLayer from "@/components/AtmosphereLayer";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const redirectTo = searchParams.get("next") || "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.splitLayout} relative`}>
      <div className="mobile-hero-glow md:hidden" aria-hidden="true" />
      <div className="mobile-stadium-lights md:hidden" aria-hidden="true" />
      <div className="mobile-pitch-floor md:hidden" aria-hidden="true" />

      {/* Left panel: Massive luxury sports branding & trust */}
      <div className={`${styles.leftPanel} hidden md:flex`}>
        <AtmosphereLayer variant="login" />
        <div className={styles.panelHeader}>
          <Logo size={36} showText={true} />
        </div>

        <div className={styles.panelMiddle}>
          <h1 className={styles.panelTitle}>
            PREDICT.<br />
            COMPETE.<br />
            <span className={styles.editorialItalic}>WIN.</span>
          </h1>
          <p className={styles.panelSubtitle}>
            Sign in to manage your picks, wallet, and reward status.
          </p>
        </div>

        <div className={styles.panelFooter}>
          <div className={styles.trustStrip}>
            <div className={styles.trustStripItem}>
              <ShieldCheck size={16} className={styles.trustIcon} />
              <span>Phone Verified</span>
            </div>
            <div className={styles.trustStripItem}>
              <ShieldCheck size={16} className={styles.trustIcon} />
              <span>Fair-Play Protection</span>
            </div>
          </div>
          <p className={styles.copyright}>&copy; {new Date().getFullYear()} NanoPlay. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel: Form input area */}
      <div className={styles.rightPanel} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Mobile top banner */}
        <div className="md:hidden relative w-full h-48 bg-[#0b0b0e] overflow-hidden flex flex-col items-center justify-center px-6 border-b border-[#1a1a1a]" style={{ position: 'relative', height: '192px', backgroundColor: '#0b0b0e', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', borderBottom: '1px solid #1a1a1a' }}>
          <div className="absolute inset-0 bg-[#D4A853]/5" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(212,168,83,0.05)', pointerEvents: 'none' }} />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#D4A853]/10 rounded-full blur-3xl" style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '160px', height: '160px', backgroundColor: 'rgba(212,168,83,0.1)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none' }} />
          <h2 className="relative z-10 text-2xl font-bold text-white text-center" style={{ position: 'relative', zIndex: 10, fontSize: '24px', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }}>
            Predict. Compete. <span className="text-[#D4A853]">Win.</span>
          </h2>
          <p className="relative z-10 text-sm text-slate-400 mt-2 text-center" style={{ position: 'relative', zIndex: 10, fontSize: '14px', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
            Sign in to manage your picks
          </p>
          <div className="relative z-10 flex gap-4 mt-4" style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '16px', marginTop: '16px' }}>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20" style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '9999px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>✓ Phone Verified</span>
            <span className="text-xs px-2 py-1 rounded-full bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20" style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '9999px', backgroundColor: 'rgba(212,168,83,0.1)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}>🛡️ Fair-Play</span>
          </div>
        </div>

        <GlassCard className={styles.loginCard} accent={true} hoverEffect={false}>
          <div className={styles.header}>
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>Sign in to manage your picks, wallet, and reward status.</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form}>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className={styles.passwordWrapper}>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Link href="/faq" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="premium" loading={loading} className={styles.submitBtn}>
              Sign In ↗
            </Button>
          </form>

          <div className={styles.footer}>
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className={styles.link}>
                Join the Arena
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container-center" style={{ flex: 1 }}>
        <div className="font-data">LOADING...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
