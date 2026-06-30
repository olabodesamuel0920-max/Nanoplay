// src/app/(auth)/signup/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/utils/url";
import GlassCard from "@/components/ui/glass-card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ShieldCheck } from "lucide-react";
import styles from "./page.module.css";
import AtmosphereLayer from "@/components/AtmosphereLayer";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic phone validation check (required for fraud control)
    if (!phone || phone.trim().length < 8) {
      setError("A valid phone number is required for account creation.");
      setLoading(false);
      return;
    }

    try {
      const fingerprint = btoa(navigator.userAgent + (navigator.language || "") + screen.width);

      // 1. Sign up user and pass phone to metadata so trigger inserts it to profiles table
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getAppUrl()}/auth/confirm`,
          data: {
            full_name: fullName,
            username: username,
            phone: phone.trim(),
            device_fingerprint: fingerprint,
          },
        },
      });

      if (signUpError) {
        let msg = signUpError.message;
        if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many requests")) {
          msg = "Too many signup attempts. Please wait a few minutes, or sign in with an existing account.";
        }
        setError(msg);
        setLoading(false);
        return;
      }

      if (authData?.user) {
        const userId = authData.user.id;

        // 2. Extra audit indicators updates
        await supabase
          .from("profiles")
          .update({
            last_device_fingerprint: fingerprint,
          })
          .eq("id", userId);

        // 3. Process referral if valid
        if (referralCode.trim() !== "") {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", referralCode.trim())
            .single();

          if (referrer) {
            await supabase.rpc("process_referral_reward_atomic", {
              p_referrer_id: referrer.id,
              p_referred_user_id: userId,
              p_referral_code: referralCode.trim(),
              p_reward_amount: 1000,
            });
          }
        }
      }

      router.push("/settings");
      router.refresh();
    } catch (err: any) {
      let msg = err.message || "An unexpected error occurred.";
      if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many requests")) {
        msg = "Too many signup attempts. Please wait a few minutes, or sign in with an existing account.";
      }
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className={styles.splitLayout}>
      {/* Left panel: Massive luxury branding & trust */}
      <div className={styles.leftPanel}>
        <AtmosphereLayer variant="signup" />
        <div className={styles.panelHeader}>
          <Logo size={36} showText={true} />
        </div>

        <div className={styles.panelMiddle}>
          <h1 className={styles.panelTitle}>
            JOIN THE ARENA.
          </h1>
          <p className={styles.panelSubtitle}>
            Create your account, verify your phone, and start building your football streak.
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

      {/* Right panel: Grid Form input area */}
      <div className={styles.rightPanel}>
        <GlassCard className={styles.signupCard} accent={true} hoverEffect={false}>
          <div className={styles.header}>
            <h2 className={styles.title}>Join the Arena.</h2>
            <p className={styles.subtitle}>Create your account, verify your phone, and start building your football streak.</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className={styles.form}>
            {/* Form grid layout */}
            <div className={styles.formGrid}>
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+2348031234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Referral Code, optional"
                type="text"
                placeholder="Referrer username"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>

            <Button type="submit" variant="premium" loading={loading} className={styles.submitBtn}>
              Create Account ↗
            </Button>
          </form>

          <div className={styles.footer}>
            <p>
              Already have an account?{" "}
              <Link href="/login" className={styles.link}>
                Sign in instead
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
