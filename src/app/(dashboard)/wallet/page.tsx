// src/app/(dashboard)/wallet/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { triggerDeposit, triggerWithdrawal } from "@/app/actions/wallet";
import { getOrCreateProfile } from "@/app/actions/verification";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { CreditCard, ArrowUpRight, ArrowDownLeft, ShieldAlert, CheckCircle, Clock, Info } from "lucide-react";
import styles from "./page.module.css";
import AtmosphereLayer from "@/components/AtmosphereLayer";
import { SkeletonCard, SkeletonTable } from "@/components/SkeletonLoader";

export default function WalletPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimeout, setShowTimeout] = useState(false);

  // Platform configs
  const [fundingEnabled, setFundingEnabled] = useState(false);
  const [paystackMode, setPaystackMode] = useState("disabled");

  // Forms
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  
  // States
  const [actionLoading, setActionLoading] = useState(false);
  const [walletMessage, setWalletMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }
      setUser(user);

      // Fetch Profile details
      const res = await getOrCreateProfile();
      let profileData = null;
      if (res.ok && res.profile) {
        profileData = res.profile;
        setProfile(profileData);
      }

      // Fetch Wallet
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setWallet(walletData);

      if (walletData) {
        // Fetch Ledger Transactions
        const { data: txs } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false });
        setTransactions(txs || []);
      }

      // Fetch platform configurations
      const { data: platformSettings } = await supabase
        .from("platform_settings")
        .select("key,value");

      const settingsMap: { [key: string]: any } = {};
      platformSettings?.forEach((s: any) => {
        try {
          settingsMap[s.key] = JSON.parse(s.value);
        } catch {
          settingsMap[s.key] = s.value;
        }
      });

      setFundingEnabled(settingsMap["wallet_funding_enabled"] || false);
      setPaystackMode(settingsMap["paystack_mode"] || "disabled");
    } catch (err) {
      console.error("Error in loadWalletData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);

    async function wrapLoad() {
      try {
        await loadWalletData();
      } catch (err) {
        console.error("Error loading wallet data:", err);
      } finally {
        clearTimeout(timer);
      }
    }
    wrapLoad();

    // Check Paystack redirect redirect parameter notifications
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get("status");
    const msg = searchParams.get("message");

    if (status === "success") {
      setWalletMessage({ type: "success", text: "Wallet successfully funded!" });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "failed") {
      setWalletMessage({ type: "error", text: msg || "Transaction verification failed." });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => clearTimeout(timer);
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(depositAmount);
    if (isNaN(amountVal) || ![5000, 10000, 20000].includes(amountVal)) {
      setWalletMessage({ type: "error", text: "Allowed deposit amounts are NGN 5,000, NGN 10,000, or NGN 20,000." });
      return;
    }

    setActionLoading(true);
    setWalletMessage(null);

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountVal }),
      });

      const res = await response.json();
      if (res.success && res.authorization_url) {
        setDepositAmount("");
        // Redirect user to Paystack checkout URL
        window.location.href = res.authorization_url;
      } else {
        setWalletMessage({ type: "error", text: res.message || "Failed to initialize deposit." });
      }
    } catch (err: any) {
      setWalletMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(withdrawAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setWalletMessage({ type: "error", text: "Please enter a valid withdrawal amount." });
      return;
    }

    if ((wallet?.balance_ngn || 0) < amountVal) {
      setWalletMessage({ type: "error", text: "Insufficient wallet balance." });
      return;
    }

    if (profile?.identity_status !== "verified") {
      setWalletMessage({
        type: "error",
        text: "Complete payout verification to request withdrawals.",
      });
      return;
    }

    setActionLoading(true);
    setWalletMessage(null);

    const res = await triggerWithdrawal(amountVal, {
      bankName: profile.bank_name,
      accountNumber: profile.bank_account_number,
      accountName: profile.bank_account_name,
    });

    if (res.success) {
      setWalletMessage({ type: "success", text: res.message });
      setWithdrawAmount("");
      await loadWalletData();
    } else {
      setWalletMessage({ type: "error", text: res.message });
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={`${styles.main} main-with-bottom-nav relative`}>
          {/* Mobile atmosphere — lightweight CSS only */}
          <div className="mobile-atmosphere md:hidden" aria-hidden="true" />
          <div className="mobile-pitch-floor md:hidden" aria-hidden="true" />
          
          <AtmosphereLayer variant="wallet" />
          <div className={styles.container}>
            <div className={styles.header} style={{ marginBottom: "2rem" }}>
              <h1 className={styles.title}>My Vault & Ledger</h1>
              <p className={styles.subtitle}>Loading wallet...</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <SkeletonTable rows={4} />
            {showTimeout && (
              <div className="text-center py-4" style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <p className="text-xs text-slate-400 mb-2">Taking longer than expected. Check your connection or refresh.</p>
                <button onClick={() => window.location.reload()} className="btn-premium" style={{ display: "inline-flex", padding: "0.5rem 1rem", minHeight: "44px" }}>
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className={`${styles.main} main-with-bottom-nav relative`}>
          <div className="mobile-hero-glow mobile-only" aria-hidden="true" />
          <div className="mobile-stadium-lights mobile-only" aria-hidden="true" />
          <div className="mobile-pitch-floor mobile-only" aria-hidden="true" />
          <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '0 24px', textAlign: 'center' }}>
            <div className="w-16 h-16 rounded-2xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center mb-4" style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(212, 168, 83, 0.1)', border: '1px solid rgba(212, 168, 83, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <span className="text-3xl" style={{ fontSize: '30px' }}>🔒</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>Arena Access Required</h2>
            <p className="text-sm text-slate-400 mb-6" style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Sign in to view live challenges, make picks, and track your streak.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-[280px]" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
              <Link href="/login" className="w-full h-12 bg-[#D4A853] text-black font-bold rounded-lg flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '48px', backgroundColor: '#D4A853', color: '#000000', fontWeight: 'bold', borderRadius: '8px', textDecoration: 'none' }}>
                Sign In
              </Link>
              <Link href="/signup" className="w-full h-12 border border-[#D4A853] text-[#D4A853] font-bold rounded-lg flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '48px', border: '1px solid #D4A853', color: '#D4A853', fontWeight: 'bold', borderRadius: '8px', textDecoration: 'none' }}>
                Create Account
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={`${styles.main} main-with-bottom-nav relative`}>
        {/* Mobile atmosphere — lightweight CSS only */}
        <div className="mobile-hero-glow mobile-only" aria-hidden="true" />
        <div className="mobile-stadium-lights mobile-only" aria-hidden="true" />
        <div className="mobile-pitch-floor mobile-only" aria-hidden="true" />
        
        <AtmosphereLayer variant="wallet" />
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Wallet History</h1>
            <p className={styles.subtitle}>
              Fund your account, request payouts, and view your secure wallet records.
            </p>
          </div>

          {walletMessage && (
            <div className={walletMessage.type === "success" ? styles.successAlert : styles.errorAlert}>
              {walletMessage.text}
            </div>
          )}

          {/* Core Balance card */}
          <div className={styles.balanceGrid}>
            <GlassCard className={styles.balanceCard} accent={true}>
              <div className={styles.balanceInfo}>
                <span className={styles.balanceLabel}>Total Available Balance</span>
                <span className={[styles.balanceValue, "font-data"].join(" ")}>
                  NGN {(wallet?.balance_ngn || 0).toLocaleString()}
                </span>
                <span className={styles.balanceDesc}>Secure wallet record</span>
              </div>
            </GlassCard>

            {/* Quick warning if KYC is unverified */}
            {profile?.identity_status !== "verified" && (
              <div className={styles.kycWarningCard}>
                <ShieldAlert className={styles.warningIcon} />
                <div>
                  <h4 className={styles.warningTitle}>Payouts need verification</h4>
                  <p className={styles.warningDesc}>
                    Your payout verification is currently <strong>{profile?.identity_status || "unverified"}</strong>. Complete payout verification in Settings to request withdrawals.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* How Funding Works explanation banner (PART 4 - 1) */}
          <div className="mb-6 p-4 rounded-xl relative z-10" style={{ backgroundColor: 'var(--bg-charcoal)', border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info className="w-5 h-5" style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 className="font-semibold text-white mb-1" style={{ fontWeight: 600, color: 'var(--foreground-primary)', fontSize: '0.875rem' }}>How Funding Works</h4>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                To ensure security and prevent platform abuse, wallet funding is locked to fixed packages of NGN 5,000, NGN 10,000, or NGN 20,000. All transactions are securely processed via Paystack.
              </p>
            </div>
          </div>

          {/* Action panels: Fund / Withdraw */}
          <div className={styles.actionsGrid}>
            {/* Deposit Panel */}
             <GlassCard className={styles.actionCard}>
              <div className={styles.cardHeader}>
                <ArrowUpRight className={styles.cardHeaderIcon} />
                <h3>Fund Wallet{fundingEnabled && paystackMode === "test" ? " (Test Mode)" : ""}</h3>
              </div>
              <p className={styles.cardDesc}>
                {!fundingEnabled 
                  ? "Wallet funding is currently in launch review. Please check back when funding opens." 
                  : paystackMode === "test" 
                    ? "Test funding enabled. Enter NGN 5,000, NGN 10,000, or NGN 20,000 to initiate a test transaction."
                    : "Deposit funds to increase your available balance."}
              </p>

              <form onSubmit={handleDeposit} className={styles.form}>
                <Input
                  label="Amount to Deposit (NGN)"
                  type="number"
                  placeholder="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min={100}
                  required
                  disabled={!fundingEnabled}
                />
                <div style={{ position: 'relative', width: '100%' }} className="group">
                  <Button 
                    type="submit" 
                    variant="premium" 
                    loading={actionLoading} 
                    disabled={!fundingEnabled} 
                    className={styles.submitBtn}
                    style={{ width: '100%' }}
                  >
                    {!fundingEnabled 
                      ? "Funding Opening Soon" 
                      : paystackMode === "test" 
                        ? "Initiate Test Payment" 
                        : "Fund Wallet"}
                  </Button>
                  {!fundingEnabled && (
                    <span 
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '8px',
                        padding: '6px 10px',
                        backgroundColor: '#0b0b0e',
                        color: '#94a3b8',
                        fontSize: '11px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s ease',
                        border: '1px solid var(--border-glass)',
                        zIndex: 100
                      }}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      Opens 24h before matchday
                    </span>
                  )}
                </div>
                {!fundingEnabled && (
                  <p style={{ color: 'var(--status-error)', fontSize: '11px', marginTop: '8px', textAlign: 'center' }}>
                    Deposit options are currently paused for maintenance/review.
                  </p>
                )}
              </form>
            </GlassCard>

            {/* Withdrawal Panel */}
            <GlassCard className={styles.actionCard}>
              <div className={styles.cardHeader}>
                <ArrowDownLeft className={styles.cardHeaderIcon} />
                <h3>Request Payout</h3>
              </div>
              <p className={styles.cardDesc}>
                Withdraw cash directly to your registered bank account.
              </p>

              <form onSubmit={handleWithdrawal} className={styles.form}>
                {profile?.identity_status === "verified" ? (
                  <div className={styles.bankDetailsBox}>
                    <div className={styles.bankDetailItem}>
                      <span>Bank:</span>
                      <strong>{profile.bank_name}</strong>
                    </div>
                    <div className={styles.bankDetailItem}>
                      <span>Account:</span>
                      <strong>{profile.bank_account_number}</strong>
                    </div>
                    <div className={styles.bankDetailItem}>
                      <span>Name:</span>
                      <strong>{profile.bank_account_name}</strong>
                    </div>
                  </div>
                ) : (
                  <div className={styles.bankDetailsMissing}>
                    Complete payout verification to request withdrawals.
                  </div>
                )}

                <Input
                  label="Amount to Withdraw (NGN)"
                  type="number"
                  placeholder="5000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={profile?.identity_status !== "verified"}
                  min={1000}
                  required
                />
                 <div style={{ position: 'relative', width: '100%' }} className="group">
                  <Button
                    type="submit"
                    variant="glass"
                    loading={actionLoading}
                    disabled={profile?.identity_status !== "verified"}
                    className={styles.submitBtn}
                    style={{ width: '100%' }}
                  >
                    Request Payout
                  </Button>
                  {profile?.identity_status !== "verified" && (
                    <span 
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '8px',
                        padding: '6px 10px',
                        backgroundColor: '#0b0b0e',
                        color: '#94a3b8',
                        fontSize: '11px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s ease',
                        border: '1px solid var(--border-glass)',
                        zIndex: 100
                      }}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      Minimum ₦1,000 balance required
                    </span>
                  )}
                </div>
                {profile?.identity_status !== "verified" && (
                  <p style={{ color: 'var(--status-warning)', fontSize: '11px', marginTop: '8px', textAlign: 'center' }}>
                    Complete phone & payout verification in settings to enable withdrawals.
                  </p>
                )}
              </form>
            </GlassCard>
          </div>

          {/* Transaction History Table */}
          <div className={styles.ledgerSection}>
            <div className={styles.ledgerHeader}>
              <h3>Transaction History</h3>
              <span className={styles.ledgerSub}>Secure transaction history</span>
            </div>

             <GlassCard className={styles.tableCard} hoverEffect={false}>
               {transactions.length === 0 ? (
                 <div className={styles.noTxs}>No transaction history found.</div>
               ) : (
                 <>
                   {/* Desktop table — keep existing, wrap in hidden md:block */}
                   <div className="hidden md:block" style={{ width: '100%' }}>
                     <div className={styles.tableWrapper}>
                       <table className={styles.table}>
                         <thead>
                           <tr>
                             <th>Date</th>
                             <th>Reference</th>
                             <th>Type</th>
                             <th>Amount</th>
                             <th>Status</th>
                           </tr>
                         </thead>
                         <tbody>
                           {transactions.map((tx) => {
                             const isCredit = tx.amount >= 0;
                             const isConfirmed = tx.status === "confirmed" || tx.status === "success";
                             const isPending = tx.status === "pending";
                             const isFailed = tx.status === "failed" || tx.status === "rejected" || tx.status === "cancelled";
                             
                             const statusColor = isConfirmed ? 'var(--accent-green)' : isPending ? 'var(--accent-gold)' : 'var(--status-error)';
                             const statusBg = isConfirmed ? 'rgba(16, 185, 129, 0.1)' : isPending ? 'rgba(212, 168, 83, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                             const statusBorder = isConfirmed ? 'var(--border-green)' : isPending ? 'var(--border-gold)' : 'rgba(239, 68, 68, 0.2)';

                             return (
                               <tr key={tx.id}>
                                 <td className={styles.tdDate}>
                                   {new Date(tx.created_at).toLocaleDateString()}
                                 </td>
                                 <td className={[styles.tdRef, "font-mono-numbers"].join(" ")}>
                                   {tx.reference || "N/A"}
                                 </td>
                                 <td className={styles.tdType}>{tx.type.toUpperCase()}</td>
                                 <td
                                   className={[
                                     styles.tdAmount,
                                     "font-mono-numbers",
                                     isCredit ? styles.creditText : styles.debitText
                                   ].join(" ")}
                                 >
                                   {isCredit ? "+" : ""}NGN {tx.amount.toLocaleString()}
                                 </td>
                                 <td>
                                   <span
                                     className="badge font-mono-numbers"
                                     style={{
                                       color: statusColor,
                                       backgroundColor: statusBg,
                                       border: `1px solid ${statusBorder}`,
                                       padding: '4px 8px',
                                       borderRadius: '4px',
                                       fontSize: '11px',
                                       textTransform: 'uppercase'
                                     }}
                                   >
                                     {tx.status}
                                   </span>
                                 </td>
                               </tr>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>
                   </div>

                   {/* Mobile transaction list (< 768px) */}
                   <div className="md:hidden space-y-3" style={{ width: '100%' }}>
                     {transactions.map((tx) => {
                       const isCredit = tx.amount >= 0;
                       const isConfirmed = tx.status === "confirmed" || tx.status === "success";
                       const isPending = tx.status === "pending";
                       const isFailed = tx.status === "failed" || tx.status === "rejected" || tx.status === "cancelled";
                       
                       const statusColor = isConfirmed ? 'var(--accent-green)' : isPending ? 'var(--accent-gold)' : 'var(--status-error)';
                       const statusBg = isConfirmed ? 'rgba(16, 185, 129, 0.1)' : isPending ? 'rgba(212, 168, 83, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                       const statusBorder = isConfirmed ? 'var(--border-green)' : isPending ? 'var(--border-gold)' : 'rgba(239, 68, 68, 0.2)';

                       return (
                         <div key={tx.id} className="glass-card p-4 rounded-xl" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', marginBottom: '12px' }}>
                           <div className="flex justify-between items-center mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                             <span className="text-sm font-medium text-white" style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>{tx.type.toUpperCase()}</span>
                             <span
                               className={`text-sm font-bold font-mono-numbers ${isCredit ? 'text-green-400' : 'text-red-400'}`}
                               style={{ fontSize: '14px', fontWeight: 'bold', color: isCredit ? 'var(--accent-green)' : 'var(--status-error)' }}
                             >
                               {isCredit ? "+" : ""}₦{tx.amount.toLocaleString()}
                             </span>
                           </div>
                           <div className="flex justify-between text-xs text-slate-400" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                             <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                             <span
                               style={{
                                 color: statusColor,
                                 backgroundColor: statusBg,
                                 border: `1px solid ${statusBorder}`,
                                 padding: '2px 6px',
                                 borderRadius: '4px',
                                 fontSize: '10px',
                                 textTransform: 'uppercase'
                               }}
                             >
                               {tx.status}
                             </span>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </>
               )}
             </GlassCard>
          </div>

          <div style={{ marginTop: "32px", padding: "20px 24px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-glass)", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "var(--foreground-muted)", lineHeight: "1.6" }}>
              Disclaimer: NanoPlay is an independent sports prediction challenge platform. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with FIFA, UEFA, Champions League, Premier League, or any football clubs or players. All team names and match information are generic representations used strictly for gameplay description.
            </p>
            <p style={{ fontSize: "12px", color: "var(--foreground-secondary)", marginTop: "8px" }}>
              For support inquiries, reach out to <strong>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@nanoplay.com"}</strong> or WhatsApp: <strong>{process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+2348000000000"}</strong>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
