// src/app/(auth)/signup/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GlassCard from "@/components/ui/glass-card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import styles from "./page.module.css";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Client-side browser metadata collection (Anti-abuse)
      const fingerprint = btoa(navigator.userAgent + (navigator.language || "") + screen.width);

      // 2. Perform Supabase Sign Up with custom metadata
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
            device_fingerprint: fingerprint,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (authData?.user) {
        const userId = authData.user.id;

        // 3. Update device fingerprint & IP details on public.profiles (via client RPC or standard update if allowed by policy)
        // Note: The public.profiles table has an insert trigger `on_auth_user_created` that runs on sign up.
        // We'll update the extra metadata fields right after signup.
        await supabase
          .from("profiles")
          .update({
            last_device_fingerprint: fingerprint,
          })
          .eq("id", userId);

        // 4. Handle Referral Code if provided
        if (referralCode.trim() !== "") {
          // Find referrer profile by referral_code or username
          const { data: referrer } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", referralCode.trim())
            .single();

          if (referrer) {
            // Call atomic RPC to process the referral securely
            await supabase.rpc("process_referral_reward_atomic", {
              p_referrer_id: referrer.id,
              p_referred_user_id: userId,
              p_referral_code: referralCode.trim(),
              p_reward_amount: 1000, // ₦1,000 Referral Reward
            });
          }
        }
      }

      // Automatically route to settings/verification page to prompt for phone OTP
      router.push("/settings");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="container-center" style={{ minHeight: "100vh", background: "var(--bg-obsidian)" }}>
      <GlassCard className={styles.signupCard} accent={true}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            NANO<span className={styles.accent}>PLAY</span>
          </Link>
          <h2 className={styles.title}>Join the Arena</h2>
          <p className={styles.subtitle}>Build your streak and claim your predictions</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className={styles.form}>
          <Input
            label="Full Legal Name"
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
            label="Referral Code (Optional)"
            type="text"
            placeholder="Enter referrer username"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
          />

          <Button type="submit" variant="premium" loading={loading} className={styles.submitBtn}>
            Create Account
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
  );
}
