// src/app/(dashboard)/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { triggerSendOtp, triggerVerifyOtp, submitKycDetails } from "@/app/actions/verification";
import Navbar from "@/components/layouts/navbar";
import GlassCard from "@/components/ui/glass-card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { ShieldCheck, Phone, Landmark, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import styles from "./page.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // OTP States
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // KYC States
  const [legalName, setLegalName] = useState("");
  const [dob, setDob] = useState("");
  const [idType, setIdType] = useState("National ID");
  const [idNumber, setIdNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);
  const [kycSuccess, setKycSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

      if (data) {
        setProfile(data);
        setPhone(data.phone || "");
        setPhoneVerified(!!data.phone_verified);
        setLegalName(data.identity_legal_name || "");
        setDob(data.identity_dob || "");
        setIdType(data.identity_type || "National ID");
        setIdNumber(data.identity_number || "");
        setBankName(data.bank_name || "");
        setBankAccountNumber(data.bank_account_number || "");
        setBankAccountName(data.bank_account_name || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const res = await Promise.race([
        triggerSendOtp(phone),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 10000))
      ]);

      if (res.ok) {
        setOtpSent(true);
        setOtpSuccess("Verification code sent successfully.");
        if (res.code) {
          // Mock mode shows code in helper tag
          setOtpSuccess(`[Mock OTP Mode] Code is: ${res.code}`);
        }
      } else {
        setOtpError(res.message || "Failed to send code.");
      }
    } catch (err: any) {
      if (err.message === "TIMEOUT") {
        setOtpError("Verification is taking longer than expected. Please refresh and check your status.");
      } else {
        setOtpError(err.message || "An unexpected error occurred sending OTP.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const res = await Promise.race([
        triggerVerifyOtp(phone, otpCode),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 10000))
      ]);

      if (res.ok || res.phoneVerified) {
        // Optimistic UI updates
        setPhoneVerified(true);
        setOtpSuccess("Phone number verified successfully.");
        setOtpSent(false);
        setOtpCode("");

        // Refresh database state in background
        supabase
          .from("profiles")
          .select("*")
          .eq("id", profile.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfile(data);
            }
          });

        router.refresh();
      } else {
        setOtpError(res.message || "Invalid or expired verification code.");
      }
    } catch (err: any) {
      if (err.message === "TIMEOUT") {
        setOtpError("Verification is taking longer than expected. Please refresh and check your status.");
      } else {
        setOtpError(err.message || "An unexpected error occurred during verification.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycLoading(true);
    setKycError(null);
    setKycSuccess(null);

    try {
      const res = await submitKycDetails({
        legalName,
        dob,
        idType,
        idNumber,
        bankName,
        bankAccountNumber,
        bankAccountName,
      });

      if (res.success) {
        setKycSuccess("Payout verification details submitted successfully.");
        // Reload profile
        const { data } = await supabase.from("profiles").select("*").eq("id", profile.id).single();
        if (data) {
          setProfile(data);
        }
      } else {
        setKycError(res.message || "Failed to submit payout verification details.");
      }
    } catch (err: any) {
      setKycError(err.message || "An unexpected error occurred during payout verification submission.");
    } finally {
      setKycLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-center" style={{ flex: 1 }}>
          <div className="font-data">LOADING PROFILE...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Account Verification</h1>
            <p className={styles.subtitle}>
              Verify your phone to enter prediction rounds. Complete payout verification only when you want to request withdrawals.
            </p>
          </div>

          {/* Suspended alert */}
          {profile?.status === "suspended" && (
            <div className={styles.alertDanger}>
              <AlertTriangle size={20} />
              <span>
                <strong>Account Suspended:</strong> This account has been locked due to security violations.
              </span>
            </div>
          )}

          {/* Under Review alert */}
          {profile?.status === "under_review" && (
            <div className={styles.alertWarning}>
              <Clock size={20} />
              <span>
                <strong>Account Under Review:</strong> Your profile is currently undergoing a security audit.
              </span>
            </div>
          )}

          {/* Duplicate Bank Account Flagged */}
          {profile?.bank_account_flagged && (
            <div className={styles.alertDanger}>
              <AlertTriangle size={20} />
              <span>
                <strong>Duplicate Bank Flagged:</strong> {profile.bank_account_flagged_reason}
              </span>
            </div>
          )}

          <div className={styles.grid}>
            {/* Left Column: Phone Verification */}
            <div className={styles.column}>
              <GlassCard className={styles.card}>
                <div className={styles.cardHeader}>
                  <Phone className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Phone Verification</h3>
                </div>

                <p className={styles.cardDesc}>
                  Verifying your phone helps keep referrals fair and prevents duplicate accounts.
                </p>

                {(phoneVerified || profile?.phone_verified) ? (
                  <div className={styles.verifiedState}>
                    <CheckCircle size={20} className={styles.successIcon} />
                    <div>
                      <div className={styles.stateTitle}>Phone verified</div>
                      <div className={styles.stateValue}>Your number is verified. You can enter active rounds and use referrals.</div>
                      <div className={styles.statePhone}>{profile?.phone || phone}</div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.verificationFlow}>
                    {otpError && <div className={styles.errorAlert}>{otpError}</div>}
                    {otpSuccess && <div className={styles.successAlert}>{otpSuccess}</div>}

                    {!otpSent ? (
                      <div className={styles.formGroup}>
                        <Input
                          label="Nigerian Phone Number"
                          type="tel"
                          placeholder="e.g. 08012345678 or +234..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                        <Button
                          onClick={handleSendOtp}
                          variant="premium"
                          loading={otpLoading}
                          className={styles.actionBtn}
                        >
                          Send Verification Code
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.formGroup}>
                        <Input
                          label="Enter 6-Digit OTP Code"
                          type="text"
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          maxLength={6}
                        />
                        <div className={styles.buttonGroup}>
                          <Button
                            onClick={handleVerifyOtp}
                            variant="premium"
                            loading={otpLoading}
                            className={styles.actionBtn}
                          >
                            Verify Code
                          </Button>
                          <Button
                            onClick={() => setOtpSent(false)}
                            variant="glass"
                            className={styles.actionBtn}
                          >
                            Change Number
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Right Column: KYC Verification */}
            <div className={styles.column}>
              <GlassCard className={styles.card}>
                <div className={styles.cardHeader}>
                  <Landmark className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Payout Verification</h3>
                </div>

                <p className={styles.cardDesc}>
                  Only needed when you want to request withdrawals or receive approved rewards.
                </p>

                <div className={styles.kycStatusBanner}>
                  <span className={styles.statusLabel}>Payout Verification Status:</span>
                  {profile?.identity_status === "verified" ? (
                    <span className="badge badge-success">Verified</span>
                  ) : profile?.identity_status === "pending" ? (
                    <span className="badge badge-warning">Pending Review</span>
                  ) : profile?.identity_status === "under_review" ? (
                    <span className="badge badge-warning">Under Review</span>
                  ) : profile?.identity_status === "rejected" ? (
                    <span className="badge badge-error">Rejected</span>
                  ) : (
                    <span className="badge badge-info">Unverified</span>
                  )}
                </div>

                {profile?.admin_notes && (
                  <div className={styles.adminNotes}>
                    <strong>Reviewer Notes:</strong> {profile.admin_notes}
                  </div>
                )}

                {kycError && <div className={styles.errorAlert}>{kycError}</div>}
                {kycSuccess && <div className={styles.successAlert}>{kycSuccess}</div>}

                <form onSubmit={handleKycSubmit} className={styles.kycForm}>
                  <div className={styles.sectionHeader}>
                    <ShieldCheck size={16} />
                    <span>Legal Identity Details</span>
                  </div>

                  <Input
                    label="Full Legal Name"
                    type="text"
                    placeholder="As it appears on your ID"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    disabled={profile?.identity_status === "verified" || profile?.identity_status === "pending"}
                    required
                  />

                  <Input
                    label="Date of Birth"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    disabled={profile?.identity_status === "verified" || profile?.identity_status === "pending"}
                    required
                  />

                  <div className={styles.selectWrapper}>
                    <label className={styles.selectLabel}>ID Type</label>
                    <select
                      className={styles.selectInput}
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      disabled={profile?.identity_status === "verified" || profile?.identity_status === "pending"}
                      required
                    >
                      <option value="National ID">National ID (NIN)</option>
                      <option value="Passport">International Passport</option>
                      <option value="Driver License">Driver&apos;s License</option>
                      <option value="Voter Card">Voter&apos;s Card</option>
                    </select>
                  </div>

                  <Input
                    label="ID Document Number"
                    type="text"
                    placeholder="Enter your document or registration ID"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    disabled={profile?.identity_status === "verified" || profile?.identity_status === "pending"}
                    required
                  />

                  <div className={styles.sectionHeader}>
                    <Landmark size={16} />
                    <span>Bank Payout Account</span>
                  </div>

                  <Input
                    label="Bank Name"
                    type="text"
                    placeholder="e.g. GTBank, Zenith, Access"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    disabled={profile?.identity_status === "verified" || profile?.identity_status === "pending"}
                    required
                  />

                  <Input
                    label="Account Number (10 Digits)"
                    type="text"
                    placeholder="0123456789"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    maxLength={10}
                    disabled={profile?.identity_status === "verified" || profile?.identity_status === "pending"}
                    required
                  />

                  <Input
                    label="Account Holder Name"
                    type="text"
                    placeholder="Must match your legal name"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    disabled={profile?.identity_status === "verified" || profile?.identity_status === "pending"}
                    required
                  />

                  {profile?.identity_status !== "verified" && profile?.identity_status !== "pending" && (
                    <Button type="submit" variant="premium" loading={kycLoading} className={styles.kycSubmitBtn}>
                      Submit for Verification
                    </Button>
                  )}
                </form>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
