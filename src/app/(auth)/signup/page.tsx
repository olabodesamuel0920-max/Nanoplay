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
        if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many requests") || msg.toLowerCase().includes("exceeded")) {
          msg = "Too many attempts. Please wait 5 minutes before trying again.";
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
      if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many requests") || msg.toLowerCase().includes("exceeded")) {
        msg = "Too many attempts. Please wait 5 minutes before trying again.";
      }
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.splitLayout} relative`}>
      <div className="mobile-hero-glow mobile-only" aria-hidden="true" />
      <div className="mobile-stadium-lights mobile-only" aria-hidden="true" />
      <div className="mobile-pitch-floor mobile-only" aria-hidden="true" />

      {/* Left panel: Massive luxury branding & trust */}
      <div className={`${styles.leftPanel} desktop-flex`}>
        <AtmosphereLayer variant="signup" />
        <div className={styles.panelHeader}>
          <Logo size={36} showText={true} />
        </div>

        <div className={styles.panelMiddle}>
          <h1 className={styles.panelTitle}>
            Join the Arena
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
      <div className={styles.rightPanel} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Mobile top banner */}
        <div className="mobile-only relative w-full h-48 bg-[#0b0b0e] overflow-hidden flex flex-col items-center justify-center px-6 border-b border-[#1a1a1a]" style={{ position: 'relative', height: '192px', backgroundColor: '#0b0b0e', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', borderBottom: '1px solid #1a1a1a' }}>
          <div className="absolute inset-0 bg-[#D4A853]/5" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(212,168,83,0.05)', pointerEvents: 'none' }} />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#D4A853]/10 rounded-full blur-3xl" style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '160px', height: '160px', backgroundColor: 'rgba(212,168,83,0.1)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none' }} />
          <h2 className="relative z-10 text-2xl font-bold text-white text-center" style={{ position: 'relative', zIndex: 10, fontSize: '24px', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }}>
            Join the Arena. Start your streak.
          </h2>
          <p className="relative z-10 text-xs text-slate-400 mt-2 text-center font-semibold tracking-wide uppercase" style={{ position: 'relative', zIndex: 10, fontSize: '11px', color: '#D4A853', marginTop: '8px', textAlign: 'center', letterSpacing: '0.05em' }}>
            Step 1 of 2
          </p>
        </div>

        <GlassCard className={styles.signupCard} accent={true} hoverEffect={false}>
          <div className={styles.header}>
            <h2 className={styles.title}>Join the Arena</h2>
            <p className={styles.subtitle}>Create your account, verify your phone, and start building your football streak.</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className={styles.form}>
            {/* Form grid layout with styled sections */}
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Account details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="text-[11px] font-bold text-[#D4A853] uppercase tracking-wider mb-1" style={{ fontSize: '11px', fontWeight: 'bold', color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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
                </div>
              </div>

              {/* Contact details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="text-[11px] font-bold text-[#D4A853] uppercase tracking-wider mb-1" style={{ fontSize: '11px', fontWeight: 'bold', color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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
                </div>
              </div>

              {/* Security details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="text-[11px] font-bold text-[#D4A853] uppercase tracking-wider mb-1" style={{ fontSize: '11px', fontWeight: 'bold', color: '#D4A853', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Referral Code (optional)"
                    type="text"
                    placeholder="Referrer username"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                </div>
              </div>

            </div>

            <Button type="submit" variant="premium" loading={loading} className={styles.submitBtn} style={{ marginTop: '16px' }}>
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
