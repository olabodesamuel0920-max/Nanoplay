// src/app/(admin)/admin/security/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  updateUserStatus,
  createDemoUser,
  adjustWalletBalance,
  togglePhoneVerified,
  resetDemoWallet,
  deleteDemoUser,
} from "@/app/actions/admin";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Shield, Trophy, FileCheck, ShieldAlert, AlertTriangle, Search, Activity, UserMinus,
  UserPlus, Wallet, Phone, Trash2, RotateCcw, ChevronDown, ChevronUp,
} from "lucide-react";
import styles from "./page.module.css";

export default function AdminSecurityPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);

  // Security Users List
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<{
    walletBalance: number;
    walletId: string | null;
    referralCount: number;
    payoutStatus: string;
  } | null>(null);

  // Action state
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Demo User Creation form
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [demoEmail, setDemoEmail] = useState("");
  const [demoUsername, setDemoUsername] = useState("");
  const [demoPhone, setDemoPhone] = useState("");
  const [demoPhoneVerified, setDemoPhoneVerified] = useState(false);
  const [demoStartingBalance, setDemoStartingBalance] = useState("");

  // Wallet Adjustment form
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");

  // Demo User Deletion
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const loadSecurityData = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Fetch all users with security parameters
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (supabase) {
      loadSecurityData();
    }
  }, []);

  useEffect(() => {
    async function loadUserDetails() {
      if (!supabase) return;
      if (!selectedUser) {
        setSelectedUserDetails(null);
        return;
      }

      // Fetch Wallet Balance
      const { data: walletData } = await supabase
        .from("wallets")
        .select("id, balance_ngn")
        .eq("user_id", selectedUser.id)
        .maybeSingle();

      // Fetch Referral Count
      const { count: refCount } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", selectedUser.id);

      setSelectedUserDetails({
        walletBalance: walletData?.balance_ngn || 0,
        walletId: walletData?.id || null,
        referralCount: refCount || 0,
        payoutStatus: selectedUser.identity_status || "unverified",
      });
    }
    loadUserDetails();
  }, [selectedUser]);

  if (!supabase) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--foreground-muted)" }}>
        <p style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--foreground-primary)" }}>
          Platform services are temporarily unavailable.
        </p>
        <p>Please check your connection or try again later.</p>
      </div>
    );
  }

  // ── Handlers ──

  const handleUpdateStatus = async (userId: string, newStatus: "active" | "suspended" | "under_review") => {
    if (adminNotes.trim() === "") {
      setMessage({ type: "error", text: "Please provide a reason in the admin notes field first." });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await updateUserStatus(userId, newStatus, adminNotes);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setAdminNotes("");
        setSelectedUser(null);
        await loadSecurityData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update user status." });
    }
    setActionLoading(false);
  };

  const handleCreateDemoUser = async () => {
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await createDemoUser({
        email: demoEmail || undefined,
        username: demoUsername || undefined,
        phone: demoPhone || undefined,
        phoneVerified: demoPhoneVerified,
        startingBalance: parseInt(demoStartingBalance) || 0,
      });

      if (res.ok) {
        setMessage({ type: "success", text: res.message || "Demo user created." });
        setDemoEmail("");
        setDemoUsername("");
        setDemoPhone("");
        setDemoPhoneVerified(false);
        setDemoStartingBalance("");
        setShowDemoForm(false);
        await loadSecurityData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create demo user." });
    }
    setActionLoading(false);
  };

  const handleAdjustWallet = async () => {
    if (!selectedUser) return;
    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Enter a valid positive amount." });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await adjustWalletBalance({
        userId: selectedUser.id,
        amount,
        reason: adjustReason,
        type: adjustType,
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: `${res.message} Balance: NGN ${(res as any).balanceBefore?.toLocaleString()} → NGN ${(res as any).balanceAfter?.toLocaleString()}`,
        });
        setAdjustAmount("");
        setAdjustReason("");
        // Refresh user details
        setSelectedUser({ ...selectedUser });
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Wallet adjustment failed." });
    }
    setActionLoading(false);
  };

  const handleTogglePhone = async (verified: boolean) => {
    if (!selectedUser) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await togglePhoneVerified(selectedUser.id, verified);
      if (res.ok) {
        setMessage({ type: "success", text: res.message || "Phone verification toggled." });
        setSelectedUser({ ...selectedUser, phone_verified: verified });
        await loadSecurityData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
    setActionLoading(false);
  };

  const handleResetDemoWallet = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await resetDemoWallet(selectedUser.id);
      if (res.ok) {
        setMessage({ type: "success", text: res.message || "Wallet reset." });
        setSelectedUser({ ...selectedUser });
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
    setActionLoading(false);
  };

  const handleDeleteDemoUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await deleteDemoUser(selectedUser.id, deleteConfirmText);
      if (res.ok) {
        setMessage({ type: "success", text: res.message || "Demo user deleted." });
        setSelectedUser(null);
        setDeleteConfirmText("");
        await loadSecurityData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
    setActionLoading(false);
  };

  // Filter users based on search
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(query) ||
      u.phone?.includes(query) ||
      u.status?.toLowerCase().includes(query) ||
      u.last_device_fingerprint?.toLowerCase().includes(query) ||
      u.last_ip_address?.includes(query)
    );
  });

  const adminNav = [
    { name: "Overview", path: "/admin", icon: Shield, active: false },
    { name: "Challenges", path: "/admin/challenges", icon: Trophy, active: false },
    { name: "KYC & Payouts", path: "/admin/kyc-payouts", icon: FileCheck, active: false },
    { name: "Security & Users", path: "/admin/security", icon: ShieldAlert, active: true },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-center" style={{ flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <div
              className="animate-spin rounded-full"
              style={{ width: "32px", height: "32px", border: "2px solid #D4A853", borderTopColor: "transparent" }}
              role="status"
              aria-label="Loading"
            />
            <div className="font-data" style={{ fontSize: "12px", color: "#94a3b8" }}>Loading risk logs</div>
          </div>
        </div>
      </>
    );
  }

  const isDemo = selectedUser?.status === "demo";

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.adminHeader}>
            <div>
              <h1 className={styles.title}>Security & User Management</h1>
              <p className={styles.subtitle}>Audit accounts, manage demo users, and adjust wallet balances.</p>
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

          {/* Demo Tool Warning Banner */}
          <div style={{
            background: "rgba(255, 183, 0, 0.04)",
            border: "1px solid rgba(255, 183, 0, 0.15)",
            borderRadius: "10px",
            padding: "14px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "13px",
            color: "var(--foreground-secondary)",
          }}>
            <AlertTriangle size={18} style={{ color: "var(--status-warning)", flexShrink: 0 }} />
            <div>
              <strong style={{ color: "var(--status-warning)" }}>Demo tools are for testing only.</strong>{" "}
              Real users cannot be deleted here. All wallet adjustments are logged and audited.
            </div>
          </div>

          {/* Create Demo User Toggle */}
          <div style={{ marginBottom: "24px" }}>
            <Button
              onClick={() => setShowDemoForm(!showDemoForm)}
              variant="glass"
              className={styles.actionBtn}
              style={{ width: "auto", padding: "10px 20px", gap: "8px" }}
            >
              {showDemoForm ? <ChevronUp size={16} /> : <UserPlus size={16} />}
              <span>{showDemoForm ? "Hide Demo User Form" : "Create Demo User"}</span>
            </Button>

            {showDemoForm && (
              <GlassCard style={{ marginTop: "16px", padding: "28px" }} hoverEffect={false}>
                <div className={styles.sectionHeader}>Create Demo User</div>
                <p style={{ fontSize: "12px", color: "var(--foreground-muted)", marginBottom: "20px" }}>
                  Leave fields empty to auto-generate. Demo users are marked with status=&quot;demo&quot; and can never be admin.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <Input
                    label="Email (optional)"
                    placeholder="demo+timestamp@nanoplay.test"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                  />
                  <Input
                    label="Username (optional)"
                    placeholder="demo_user_12345"
                    value={demoUsername}
                    onChange={(e) => setDemoUsername(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <Input
                    label="Phone (optional)"
                    placeholder="+2348001234567"
                    value={demoPhone}
                    onChange={(e) => setDemoPhone(e.target.value)}
                  />
                  <Input
                    label="Starting Balance NGN (optional)"
                    type="number"
                    placeholder="0"
                    value={demoStartingBalance}
                    onChange={(e) => setDemoStartingBalance(e.target.value)}
                    min={0}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <input
                    type="checkbox"
                    id="demoPhoneVerifiedToggle"
                    checked={demoPhoneVerified}
                    onChange={(e) => setDemoPhoneVerified(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--accent-lime)" }}
                  />
                  <label htmlFor="demoPhoneVerifiedToggle" style={{ fontSize: "13px", color: "var(--foreground-secondary)" }}>
                    Mark phone as verified
                  </label>
                </div>

                <Button
                  onClick={handleCreateDemoUser}
                  variant="premium"
                  loading={actionLoading}
                  style={{ width: "100%" }}
                >
                  <UserPlus size={16} />
                  <span>Create Demo User</span>
                </Button>
              </GlassCard>
            )}
          </div>

          <div className={styles.grid}>
            {/* Left Column: Users List & Search */}
            <div className={styles.column}>
              <div className={styles.searchRow}>
                <div className={styles.searchWrapper}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by username, phone, status, IP..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.usersList}>
                {filteredUsers.length === 0 ? (
                  <div className={styles.noUsers}>No users matched your query.</div>
                ) : (
                  filteredUsers.map((u) => {
                    const isHighRisk = u.risk_score >= 70;
                    const isFlagged = u.bank_account_flagged;
                    const isDemoUser = u.status === "demo";

                    return (
                      <div
                        key={u.id}
                        className={[
                          styles.userItem,
                          selectedUser?.id === u.id ? styles.userItemSelected : "",
                          isHighRisk ? styles.userItemHighRisk : ""
                        ].join(" ")}
                        onClick={() => {
                          setSelectedUser(u);
                          setMessage(null);
                          setDeleteConfirmText("");
                        }}
                      >
                        <div className={styles.userInfo}>
                          <div className={styles.userUsername}>
                            {u.username}
                            {u.role === "admin" && <span className={styles.adminTag}>Admin</span>}
                            {isDemoUser && (
                              <span style={{
                                background: "rgba(0, 240, 255, 0.08)",
                                color: "var(--accent-cyan)",
                                border: "1px solid rgba(0, 240, 255, 0.2)",
                                fontFamily: "var(--font-data), monospace",
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                letterSpacing: "0.05em",
                              }}>
                                Demo
                              </span>
                            )}
                          </div>
                          <div className={styles.userStatusRow}>
                            <span className={["badge", u.status === "active" ? "badge-success" : u.status === "suspended" ? "badge-error" : u.status === "demo" ? "badge-warning" : "badge-warning"].join(" ")}>
                              {u.status}
                            </span>
                            {isFlagged && (
                              <span className={styles.flaggedBadge} title="Duplicate Bank Account Details">
                                <AlertTriangle size={12} />
                                <span>Bank Flagged</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={styles.userRiskScore}>
                          <span className={isHighRisk ? styles.riskHighText : styles.riskLowText}>
                            {u.risk_score}% Risk
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: User Audit & Demo Management */}
            <div className={styles.column}>
              {selectedUser ? (
                <>
                  {/* User Profile Card */}
                  <GlassCard className={styles.auditCard} accent={selectedUser.risk_score >= 70}>
                    <div className={styles.auditCardHeader}>
                      <ShieldAlert size={24} className={styles.cardHeaderIcon} />
                      <div>
                        <h3>Audit: {selectedUser.username}</h3>
                        <span className={styles.auditSub}>
                          {isDemo ? "DEMO ACCOUNT" : "Account security logs & parameters"}
                        </span>
                      </div>
                    </div>

                    {/* Indicators List */}
                    <div className={styles.indicatorsGrid}>
                      <div className={styles.indicatorItem}>
                        <span>Risk Coefficient:</span>
                        <strong className={selectedUser.risk_score >= 70 ? styles.riskHighText : styles.riskLowText}>
                          {selectedUser.risk_score}%
                        </strong>
                      </div>
                      <div className={styles.indicatorItem}>
                        <span>Account Status:</span>
                        <strong>{selectedUser.status.toUpperCase()}</strong>
                      </div>
                      <div className={styles.indicatorItem}>
                        <span>Phone verified:</span>
                        <strong style={{ color: selectedUser.phone_verified ? "var(--status-success)" : "var(--foreground-muted)" }}>
                          {selectedUser.phone_verified ? "YES" : "NO"}
                        </strong>
                      </div>
                      <div className={styles.indicatorItem}>
                        <span>Normalized Phone:</span>
                        <strong className="font-data">{selectedUser.normalized_phone || "N/A"}</strong>
                      </div>
                      <div className={styles.indicatorItem}>
                        <span>Wallet Balance:</span>
                        <strong className="font-data">NGN {selectedUserDetails ? selectedUserDetails.walletBalance.toLocaleString() : "..."}</strong>
                      </div>
                      <div className={styles.indicatorItem}>
                        <span>Referral Count:</span>
                        <strong className="font-data">{selectedUserDetails ? selectedUserDetails.referralCount : "..."} referrals</strong>
                      </div>
                      <div className={styles.indicatorItem}>
                        <span>Payout Status:</span>
                        <strong style={{ color: selectedUser.identity_status === "verified" ? "var(--status-success)" : selectedUser.identity_status === "pending" ? "var(--accent-gold)" : "var(--foreground-muted)" }}>
                          {selectedUser.identity_status ? selectedUser.identity_status.toUpperCase() : "UNVERIFIED"}
                        </strong>
                      </div>
                      <div className={styles.indicatorItem}>
                        <span>Device Fingerprint:</span>
                        <strong className={[styles.codeText, "font-data"].join(" ")}>
                          {selectedUser.last_device_fingerprint || "N/A"}
                        </strong>
                      </div>
                    </div>

                    {selectedUser.bank_account_flagged && (
                      <div className={styles.flaggedAlertBox}>
                        <AlertTriangle size={18} />
                        <div>
                          <strong>Bank Account Flags active:</strong>
                          <p>{selectedUser.bank_account_flagged_reason}</p>
                        </div>
                      </div>
                    )}

                    {selectedUser.admin_notes && (
                      <div className={styles.auditNotesBox}>
                        <strong>Active Admin Notes:</strong>
                        <p>{selectedUser.admin_notes}</p>
                      </div>
                    )}

                    {/* Security Adjustments Section */}
                    <div className={styles.actionForm}>
                      <div className={styles.sectionHeader}>Security Adjustments</div>

                      <div className={styles.notesWrapper}>
                        <label className={styles.notesLabel}>Status Adjustment Reason</label>
                        <textarea
                          className={styles.notesTextArea}
                          placeholder="Enter the security adjustment rationale (required for actions)..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                        />
                      </div>

                      <div className={styles.buttonGroup}>
                        <Button
                          onClick={() => handleUpdateStatus(selectedUser.id, "suspended")}
                          variant="danger"
                          loading={actionLoading}
                          className={styles.actionBtn}
                        >
                          <UserMinus size={16} />
                          <span>Suspend</span>
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(selectedUser.id, "under_review")}
                          variant="glass"
                          loading={actionLoading}
                          className={styles.actionBtn}
                        >
                          Flag Review
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(selectedUser.id, "active")}
                          variant="premium"
                          loading={actionLoading}
                          className={styles.actionBtn}
                        >
                          Activate
                        </Button>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Wallet Adjustment Card */}
                  <GlassCard style={{ padding: "28px" }} hoverEffect={false}>
                    <div className={styles.sectionHeader} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Wallet size={16} />
                      <span>Wallet Credit / Debit</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--foreground-muted)", marginBottom: "16px" }}>
                      All adjustments create audited ledger transactions. No direct balance mutation.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ fontSize: "11px", color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                          Type
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => setAdjustType("credit")}
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: "8px",
                              border: `1px solid ${adjustType === "credit" ? "var(--accent-lime)" : "var(--border-glass)"}`,
                              background: adjustType === "credit" ? "rgba(132, 204, 22, 0.08)" : "rgba(0, 0, 0, 0.3)",
                              color: adjustType === "credit" ? "var(--accent-lime)" : "var(--foreground-secondary)",
                              fontWeight: 700,
                              fontSize: "12px",
                              cursor: "pointer",
                              textTransform: "uppercase",
                            }}
                          >
                            + Credit
                          </button>
                          <button
                            onClick={() => setAdjustType("debit")}
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: "8px",
                              border: `1px solid ${adjustType === "debit" ? "var(--status-error)" : "var(--border-glass)"}`,
                              background: adjustType === "debit" ? "rgba(255, 42, 95, 0.08)" : "rgba(0, 0, 0, 0.3)",
                              color: adjustType === "debit" ? "var(--status-error)" : "var(--foreground-secondary)",
                              fontWeight: 700,
                              fontSize: "12px",
                              cursor: "pointer",
                              textTransform: "uppercase",
                            }}
                          >
                            − Debit
                          </button>
                        </div>
                      </div>
                      <Input
                        label="Amount (NGN)"
                        type="number"
                        placeholder="10000"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        min={1}
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "11px", color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                        Reason / Note (required)
                      </label>
                      <textarea
                        className={styles.notesTextArea}
                        style={{ height: "60px" }}
                        placeholder="e.g. Test seed credit for QA, Demo balance adjustment..."
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handleAdjustWallet}
                      variant={adjustType === "credit" ? "premium" : "danger"}
                      loading={actionLoading}
                      style={{ width: "100%" }}
                    >
                      <Wallet size={16} />
                      <span>Apply {adjustType === "credit" ? "Credit" : "Debit"}</span>
                    </Button>
                  </GlassCard>

                  {/* Demo-Only Controls */}
                  {isDemo && (
                    <GlassCard style={{ padding: "28px" }} hoverEffect={false}>
                      <div className={styles.sectionHeader} style={{ color: "var(--accent-cyan)" }}>
                        Demo User Controls
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--foreground-muted)", marginBottom: "20px" }}>
                        These controls only appear for demo users (status=&quot;demo&quot;). Real users cannot be affected.
                      </p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                        <Button
                          onClick={() => handleTogglePhone(!selectedUser.phone_verified)}
                          variant="glass"
                          loading={actionLoading}
                          className={styles.actionBtn}
                        >
                          <Phone size={14} />
                          <span>{selectedUser.phone_verified ? "Unverify Phone" : "Verify Phone"}</span>
                        </Button>
                        <Button
                          onClick={handleResetDemoWallet}
                          variant="glass"
                          loading={actionLoading}
                          className={styles.actionBtn}
                        >
                          <RotateCcw size={14} />
                          <span>Reset Wallet</span>
                        </Button>
                        <Button
                          onClick={() => {/* scroll to delete section */}}
                          variant="danger"
                          className={styles.actionBtn}
                          disabled
                          style={{ opacity: deleteConfirmText === "DELETE DEMO USER" ? 1 : 0.5 }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </Button>
                      </div>

                      {/* Delete Confirmation */}
                      <div style={{
                        background: "rgba(255, 42, 95, 0.03)",
                        border: "1px solid rgba(255, 42, 95, 0.12)",
                        borderRadius: "8px",
                        padding: "16px",
                      }}>
                        <p style={{ fontSize: "12px", color: "var(--status-error)", marginBottom: "10px", fontWeight: 600 }}>
                          To delete this demo user permanently, type &quot;DELETE DEMO USER&quot; below:
                        </p>
                        <input
                          type="text"
                          placeholder="Type DELETE DEMO USER"
                          className={styles.searchInput}
                          style={{ marginBottom: "12px", borderColor: deleteConfirmText === "DELETE DEMO USER" ? "var(--status-error)" : undefined }}
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                        />
                        <Button
                          onClick={handleDeleteDemoUser}
                          variant="danger"
                          loading={actionLoading}
                          disabled={deleteConfirmText !== "DELETE DEMO USER"}
                          style={{ width: "100%" }}
                        >
                          <Trash2 size={16} />
                          <span>Permanently Delete Demo User</span>
                        </Button>
                      </div>
                    </GlassCard>
                  )}

                  {/* Non-demo user protection notice */}
                  {!isDemo && selectedUser.role !== "admin" && (
                    <div style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px dashed rgba(255, 255, 255, 0.08)",
                      borderRadius: "10px",
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--foreground-muted)",
                      fontSize: "13px",
                    }}>
                      <Shield size={20} style={{ marginBottom: "8px", opacity: 0.5 }} />
                      <p>This is a real user account. Demo deletion and wallet reset controls are not available for real accounts.</p>
                    </div>
                  )}
                </>
              ) : (
                <GlassCard className={styles.noAuditCard}>
                  <Activity className={styles.noAuditIcon} />
                  <h3>Select an account to audit</h3>
                  <p>Click on any user from the list to review their profile, wallet, and security parameters. Use the demo user form above to create test accounts.</p>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
