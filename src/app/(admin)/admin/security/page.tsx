// src/app/(admin)/admin/security/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { updateUserStatus } from "@/app/actions/admin";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Shield, Trophy, FileCheck, ShieldAlert, AlertTriangle, Search, Activity, UserMinus } from "lucide-react";
import styles from "./page.module.css";

export default function AdminSecurityPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // Security Users List
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<{ walletBalance: number; referralCount: number; payoutStatus: string } | null>(null);
  
  // Action state
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSecurityData = async () => {
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
      .order("risk_score", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  useEffect(() => {
    async function loadUserDetails() {
      if (!selectedUser) {
        setSelectedUserDetails(null);
        return;
      }

      // Fetch Wallet Balance
      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance_ngn")
        .eq("user_id", selectedUser.id)
        .maybeSingle();

      // Fetch Referral Count
      const { count: refCount } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", selectedUser.id);

      setSelectedUserDetails({
        walletBalance: walletData?.balance_ngn || 0,
        referralCount: refCount || 0,
        payoutStatus: selectedUser.identity_status || "unverified",
      });
    }
    loadUserDetails();
  }, [selectedUser]);

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

  // Filter users based on search
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(query) ||
      u.phone?.includes(query) ||
      u.last_device_fingerprint?.toLowerCase().includes(query) ||
      u.last_ip_address?.includes(query)
    );
  });

  const adminNav = [
    { name: "Overview", path: "/admin", icon: Shield, active: false },
    { name: "Challenges", path: "/admin/challenges", icon: Trophy, active: false },
    { name: "KYC & Payouts", path: "/admin/kyc-payouts", icon: FileCheck, active: false },
    { name: "Security & Fraud", path: "/admin/security", icon: ShieldAlert, active: true },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-center" style={{ flex: 1 }}>
          <div className="font-data">LOADING RISK LOGS...</div>
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
              <h1 className={styles.title}>Fraud & Security Panel</h1>
              <p className={styles.subtitle}>Audit device fingerprints, manage risk coefficients, and suspend suspicious accounts.</p>
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

          <div className={styles.grid}>
            {/* Left Column: Users List & Search */}
            <div className={styles.column}>
              <div className={styles.searchRow}>
                <div className={styles.searchWrapper}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by username, fingerprint, IP, or phone..."
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
                        }}
                      >
                        <div className={styles.userInfo}>
                          <div className={styles.userUsername}>
                            {u.username}
                            {u.role === "admin" && <span className={styles.adminTag}>Admin</span>}
                          </div>
                          <div className={styles.userStatusRow}>
                            <span className={["badge", u.status === "active" ? "badge-success" : u.status === "suspended" ? "badge-error" : "badge-warning"].join(" ")}>
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

            {/* Right Column: User Security Audit & Adjustments */}
            <div className={styles.column}>
              {selectedUser ? (
                <GlassCard className={styles.auditCard} accent={selectedUser.risk_score >= 70}>
                  <div className={styles.auditCardHeader}>
                    <ShieldAlert size={24} className={styles.cardHeaderIcon} />
                    <div>
                      <h3>Audit: {selectedUser.username}</h3>
                      <span className={styles.auditSub}>Account security logs & parameters</span>
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
                      <strong>{selectedUser.phone_verified ? "YES" : "NO"}</strong>
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
                    <div className={styles.indicatorItem}>
                      <span>IP Address:</span>
                      <strong className="font-data">{selectedUser.last_ip_address || "N/A"}</strong>
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

                  {/* Actions Section */}
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
                        <span>Suspend Account</span>
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
                        Activate / Clear Flags
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className={styles.noAuditCard}>
                  <Activity className={styles.noAuditIcon} />
                  <h3>Select an account to audit</h3>
                  <p>Click on any user from the ledger list to review device fingerprints, normalize indicators, and toggle flags.</p>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
