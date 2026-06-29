// src/app/(dashboard)/wallet/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { triggerDeposit, triggerWithdrawal } from "@/app/actions/wallet";
import { getOrCreateProfile } from "@/app/actions/verification";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { CreditCard, ArrowUpRight, ArrowDownLeft, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import styles from "./page.module.css";

export default function WalletPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

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
    setLoading(false);
  };

  useEffect(() => {
    loadWalletData();

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
        <div className="container-center" style={{ flex: 1 }}>
          <div className="font-data">LOADING WALLET RECORD...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
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

          {/* Action panels: Fund / Withdraw */}
          <div className={styles.actionsGrid}>
            {/* Deposit Panel */}
             <GlassCard className={styles.actionCard}>
              <div className={styles.cardHeader}>
                <ArrowUpRight className={styles.cardHeaderIcon} />
                <h3>Fund Wallet {paystackMode === "test" && "(Test Mode)"}</h3>
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
                <Button 
                  type="submit" 
                  variant="premium" 
                  loading={actionLoading} 
                  disabled={!fundingEnabled} 
                  className={styles.submitBtn}
                >
                  {!fundingEnabled 
                    ? "Funding Opening Soon" 
                    : paystackMode === "test" 
                      ? "Initiate Test Payment" 
                      : "Fund Wallet"}
                </Button>
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
                <Button
                  type="submit"
                  variant="glass"
                  loading={actionLoading}
                  disabled={profile?.identity_status !== "verified"}
                  className={styles.submitBtn}
                >
                  Request Payout
                </Button>
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
                        return (
                          <tr key={tx.id}>
                            <td className={styles.tdDate}>
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                            <td className={[styles.tdRef, "font-data"].join(" ")}>
                              {tx.reference || "N/A"}
                            </td>
                            <td className={styles.tdType}>{tx.type.toUpperCase()}</td>
                            <td
                              className={[
                                styles.tdAmount,
                                "font-data",
                                isCredit ? styles.creditText : styles.debitText
                              ].join(" ")}
                            >
                              {isCredit ? "+" : ""}NGN {tx.amount.toLocaleString()}
                            </td>
                            <td>
                              <span
                                className={[
                                  "badge",
                                  tx.status === "confirmed" ? "badge-success" : tx.status === "pending" ? "badge-warning" : "badge-error"
                                ].join(" ")}
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
