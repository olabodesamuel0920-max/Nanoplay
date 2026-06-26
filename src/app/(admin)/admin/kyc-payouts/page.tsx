// src/app/(admin)/admin/kyc-payouts/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { resolveKyc, resolvePayout, approveWinner } from "@/app/actions/admin";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import Button from "@/components/ui/button";
import { Shield, Trophy, FileCheck, ShieldAlert, Check, X, FileText } from "lucide-react";
import styles from "./page.module.css";

export default function AdminKycPayoutsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // Queues
  const [kycPending, setKycPending] = useState<any[]>([]);
  const [payoutPending, setPayoutPending] = useState<any[]>([]);
  const [winnersPending, setWinnersPending] = useState<any[]>([]);

  // Action Inputs
  const [kycNotes, setKycNotes] = useState<{ [userId: string]: string }>({});
  const [payoutNotes, setPayoutNotes] = useState<{ [requestId: string]: string }>({});

  // States
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadQueuesData = async () => {
    // 1. Fetch pending KYC users
    const { data: kycData } = await supabase
      .from("profiles")
      .select("*")
      .eq("identity_status", "pending")
      .order("created_at", { ascending: true });
    setKycPending(kycData || []);

    // 2. Fetch pending payout requests
    const { data: payoutData } = await supabase
      .from("payout_requests")
      .select(`
        id,
        amount,
        bank_account_info,
        created_at,
        profile:user_id (
          username,
          risk_score,
          bank_account_flagged
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setPayoutPending(payoutData || []);

    // 3. Fetch unverified winners
    const { data: winnersData } = await supabase
      .from("winners")
      .select(`
        id,
        payout_amount,
        created_at,
        profile:user_id (
          username,
          risk_score
        ),
        round:round_id (
          round_number
        )
      `)
      .eq("verified", false)
      .order("created_at", { ascending: true });
    setWinnersPending(winnersData || []);

    setLoading(false);
  };

  useEffect(() => {
    loadQueuesData();
  }, []);

  const handleKycNoteChange = (userId: string, value: string) => {
    setKycNotes((prev) => ({ ...prev, [userId]: value }));
  };

  const handlePayoutNoteChange = (requestId: string, value: string) => {
    setPayoutNotes((prev) => ({ ...prev, [requestId]: value }));
  };

  const handleResolveKyc = async (userId: string, action: "verified" | "rejected") => {
    setActionLoading(true);
    setMessage(null);

    const notes = kycNotes[userId] || "";
    if (action === "rejected" && notes.trim() === "") {
      setMessage({ type: "error", text: "Please provide review notes when rejecting KYC." });
      setActionLoading(false);
      return;
    }

    try {
      const res = await resolveKyc(userId, action, notes);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        await loadQueuesData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to resolve KYC." });
    }
    setActionLoading(false);
  };

  const handleResolvePayout = async (requestId: string, action: "completed" | "rejected") => {
    setActionLoading(true);
    setMessage(null);

    const notes = payoutNotes[requestId] || "";
    if (action === "rejected" && notes.trim() === "") {
      setMessage({ type: "error", text: "Please provide admin notes when rejecting payouts." });
      setActionLoading(false);
      return;
    }

    try {
      const res = await resolvePayout(requestId, action, notes);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        await loadQueuesData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to resolve payout." });
    }
    setActionLoading(false);
  };

  const handleApproveWinner = async (winnerId: string) => {
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await approveWinner(winnerId);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        await loadQueuesData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to approve winner." });
    }
    setActionLoading(false);
  };

  const adminNav = [
    { name: "Overview", path: "/admin", icon: Shield, active: false },
    { name: "Challenges", path: "/admin/challenges", icon: Trophy, active: false },
    { name: "KYC & Payouts", path: "/admin/kyc-payouts", icon: FileCheck, active: true },
    { name: "Security & Fraud", path: "/admin/security", icon: ShieldAlert, active: false },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-center" style={{ flex: 1 }}>
          <div className="font-data">LOADING VERIFICATION QUEUES...</div>
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
          <div className={styles.adminHeader}>
            <div>
              <h1 className={styles.title}>Audit Queues</h1>
              <p className={styles.subtitle}>Review user KYC submissions, release payout requests, and verify round winners.</p>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className={styles.tabNav}>
            {adminNav.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={[styles.tabItem, tab.active ? styles.tabActive : ""].join(" ")}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>

          {message && (
            <div className={message.type === "success" ? styles.successAlert : styles.errorAlert}>
              {message.text}
            </div>
          )}

          {/* Section 1: Winner Review Queue */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Winner Review Queue ({winnersPending.length})</div>
            {winnersPending.length === 0 ? (
              <div className={styles.noItems}>No winners pending review.</div>
            ) : (
              <div className={styles.queueGrid}>
                {winnersPending.map((w) => (
                  <GlassCard key={w.id} className={styles.queueCard} accent={true}>
                    <div className={styles.cardHeader}>
                      <Trophy size={20} className={styles.cardHeaderIcon} />
                      <div>
                        <h4>{w.profile?.username}</h4>
                        <span className={styles.cardSub}>Round #{w.round?.round_number} Champion</span>
                      </div>
                    </div>

                    <div className={styles.detailList}>
                      <div className={styles.detailItem}>
                        <span>Reward Amount:</span>
                        <strong className="font-data">₦{w.payout_amount.toLocaleString()}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>User Risk Score:</span>
                        <span className={w.profile?.risk_score >= 70 ? styles.riskHigh : styles.riskLow}>
                          {w.profile?.risk_score}%
                        </span>
                      </div>
                    </div>

                    <div className={styles.actionRow}>
                      <Button
                        onClick={() => handleApproveWinner(w.id)}
                        variant="premium"
                        loading={actionLoading}
                        className={styles.actionBtn}
                      >
                        <Check size={16} />
                        <span>Release Reward to Wallet</span>
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: KYC Review Queue */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>KYC Verification Queue ({kycPending.length})</div>
            {kycPending.length === 0 ? (
              <div className={styles.noItems}>No KYC submissions pending review.</div>
            ) : (
              <div className={styles.queueGrid}>
                {kycPending.map((p) => (
                  <GlassCard key={p.id} className={styles.queueCard}>
                    <div className={styles.cardHeader}>
                      <FileText size={20} className={styles.cardHeaderIcon} />
                      <div>
                        <h4>{p.username}</h4>
                        <span className={styles.cardSub}>KYC Submission</span>
                      </div>
                    </div>

                    <div className={styles.detailList}>
                      <div className={styles.detailItem}>
                        <span>Legal Name:</span>
                        <strong>{p.identity_legal_name}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Date of Birth:</span>
                        <strong>{new Date(p.identity_dob).toLocaleDateString()}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>ID Type / Number:</span>
                        <strong>{p.identity_type} / {p.identity_number}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Bank Name:</span>
                        <strong>{p.bank_name}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Account Number:</span>
                        <strong>{p.bank_account_number}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Account Name:</span>
                        <strong>{p.bank_account_name}</strong>
                      </div>
                    </div>

                    <div className={styles.notesInputArea}>
                      <input
                        type="text"
                        className={styles.notesInput}
                        placeholder="Admin review notes (required for rejection)"
                        value={kycNotes[p.id] || ""}
                        onChange={(e) => handleKycNoteChange(p.id, e.target.value)}
                      />
                    </div>

                    <div className={styles.buttonGroup}>
                      <Button
                        onClick={() => handleResolveKyc(p.id, "verified")}
                        variant="premium"
                        loading={actionLoading}
                        className={styles.approveBtn}
                      >
                        Approve KYC
                      </Button>
                      <Button
                        onClick={() => handleResolveKyc(p.id, "rejected")}
                        variant="danger"
                        loading={actionLoading}
                        className={styles.rejectBtn}
                      >
                        Reject
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Payout Review Queue */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Payout Release Queue ({payoutPending.length})</div>
            {payoutPending.length === 0 ? (
              <div className={styles.noItems}>No payout requests pending review.</div>
            ) : (
              <div className={styles.queueGrid}>
                {payoutPending.map((r) => (
                  <GlassCard key={r.id} className={styles.queueCard}>
                    <div className={styles.cardHeader}>
                      <FileText size={20} className={styles.cardHeaderIcon} />
                      <div>
                        <h4>{r.profile?.username}</h4>
                        <span className={styles.cardSub}>Withdrawal Payout Request</span>
                      </div>
                    </div>

                    <div className={styles.detailList}>
                      <div className={styles.detailItem}>
                        <span>Withdrawal Amount:</span>
                        <strong className="font-data" style={{ color: "var(--accent-lime)" }}>
                          ₦{r.amount.toLocaleString()}
                        </strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Bank Name:</span>
                        <strong>{r.bank_account_info?.bank_name}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Account Number:</span>
                        <strong>{r.bank_account_info?.account_number}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>Account Name:</span>
                        <strong>{r.bank_account_info?.account_name}</strong>
                      </div>
                      <div className={styles.detailItem}>
                        <span>User Risk Score:</span>
                        <span className={r.profile?.risk_score >= 70 ? styles.riskHigh : styles.riskLow}>
                          {r.profile?.risk_score}%
                        </span>
                      </div>
                    </div>

                    <div className={styles.notesInputArea}>
                      <input
                        type="text"
                        className={styles.notesInput}
                        placeholder="Admin notes (required for rejection)"
                        value={payoutNotes[r.id] || ""}
                        onChange={(e) => handlePayoutNoteChange(r.id, e.target.value)}
                      />
                    </div>

                    <div className={styles.buttonGroup}>
                      <Button
                        onClick={() => handleResolvePayout(r.id, "completed")}
                        variant="premium"
                        loading={actionLoading}
                        className={styles.approveBtn}
                      >
                        Approve & Release
                      </Button>
                      <Button
                        onClick={() => handleResolvePayout(r.id, "rejected")}
                        variant="danger"
                        loading={actionLoading}
                        className={styles.rejectBtn}
                      >
                        Reject
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
