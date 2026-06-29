// src/app/(dashboard)/wallet/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { triggerDeposit, triggerWithdrawal } from "@/app/actions/wallet";
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
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(profileData);

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
    setLoading(false);
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(depositAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setWalletMessage({ type: "error", text: "Please enter a valid deposit amount." });
      return;
    }

    setActionLoading(true);
    setWalletMessage(null);

    // Simulate Paystack duplicate reference protection by generating a unique reference
    const paystackRef = `pstk_ref_${Math.random().toString(36).substr(2, 9)}`;

    const res = await triggerDeposit(amountVal, paystackRef);
    if (res.success) {
      setWalletMessage({ type: "success", text: res.message });
      setDepositAmount("");
      await loadWalletData();
    } else {
      setWalletMessage({ type: "error", text: res.message });
    }
    setActionLoading(false);
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
                <h3>Fund Wallet</h3>
              </div>
              <p className={styles.cardDesc}>
                Wallet funding is currently in launch review. Please check back when funding opens.
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
                  disabled={true}
                />
                <Button type="submit" variant="premium" loading={actionLoading} disabled={true} className={styles.submitBtn}>
                  Funding Opening Soon
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
        </div>
      </main>
    </>
  );
}
