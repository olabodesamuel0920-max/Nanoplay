// src/app/(auth)/login/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GlassCard from "@/components/ui/glass-card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
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

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="container-center" style={{ minHeight: "100vh", background: "var(--bg-obsidian)" }}>
      <GlassCard className={styles.loginCard} accent={true}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            NANO<span className={styles.accent}>PLAY</span>
          </Link>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Enter your credentials to access the Arena</p>
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

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="premium" loading={loading} className={styles.submitBtn}>
            Sign In
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className={styles.link}>
              Create one now
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
