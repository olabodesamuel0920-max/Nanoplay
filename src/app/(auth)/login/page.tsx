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
    <div className={styles.splitLayout}>
      {/* Left panel: Massive luxury sports branding & trust */}
      <div className={styles.leftPanel}>
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
      <div className={styles.rightPanel}>
        <GlassCard className={styles.loginCard} accent={true} hoverEffect={false}>
          <div className={styles.header}>
            <h2 className={styles.title}>Welcome Back.</h2>
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
