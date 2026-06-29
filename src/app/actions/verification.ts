// src/app/actions/verification.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOtp as sendSmsOtp, verifyOtp as verifySmsOtp } from "@/lib/sms";

/**
 * Server Action to ensure user profile and wallet exist in database (Idempotent)
 */
export async function getOrCreateProfile() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, message: "Unauthorized. Please sign in." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Try to fetch the user's profile row
    const { data: profileData, error } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return { ok: false, message: "Error looking up profile: " + error.message };
    }

    let profile = profileData;

    if (!profile) {
      // 2. Profile is missing, insert it atomically
      const emailPrefix = user.email ? user.email.split("@")[0] : "user";
      const uniqueUsername = `${emailPrefix}_${Math.random().toString(36).substring(2, 6)}`;
      const fullName = user.user_metadata?.full_name || "";
      const phone = user.user_metadata?.phone || "";

      const { data: newProfile, error: insertError } = await adminClient
        .from("profiles")
        .insert({
          id: user.id,
          full_name: fullName,
          username: uniqueUsername,
          phone: phone,
          phone_verified: false,
          identity_status: "unverified",
        })
        .select()
        .single();

      if (insertError) {
        // If conflict on username, try another random username
        if (insertError.code === "23505") { // Unique key violation
          const fallbackUsername = `${emailPrefix}_${Math.random().toString(36).substring(2, 8)}`;
          const { data: retryProfile, error: retryError } = await adminClient
            .from("profiles")
            .insert({
              id: user.id,
              full_name: fullName,
              username: fallbackUsername,
              phone: phone,
              phone_verified: false,
              identity_status: "unverified",
            })
            .select()
            .single();

          if (retryError) {
            return { ok: false, message: "Failed to create user profile: " + retryError.message };
          }
          profile = retryProfile;
        } else {
          return { ok: false, message: "Failed to create user profile: " + insertError.message };
        }
      } else {
        profile = newProfile;
      }
    }

    // 3. Ensure wallet exists
    const { data: wallet } = await adminClient
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!wallet) {
      await adminClient
        .from("wallets")
        .insert({
          user_id: user.id,
          balance_ngn: 0,
        });
    }

    return { ok: true, profile };
  } catch (err: any) {
    return { ok: false, message: err.message || "An unexpected error occurred retrieving profile." };
  }
}

/**
 * Server Action to trigger sending a phone OTP verification code
 */
export async function triggerSendOtp(phone: string) {
  if (!phone || phone.trim() === "") {
    return { ok: false, message: "Phone number is required." };
  }

  // Ensure profile exists first
  const profileRes = await getOrCreateProfile();
  if (!profileRes.ok || !profileRes.profile) {
    return { ok: false, message: profileRes.message || "User profile not found." };
  }

  const supabase = await createClient();

  // Generate and send OTP via SMS abstraction
  const result = await sendSmsOtp(phone.trim(), supabase);
  return {
    ok: result.success,
    message: result.message,
    code: result.code, // returned in mock mode
  };
}

/**
 * Server Action to verify a phone OTP code
 */
export async function triggerVerifyOtp(phone: string, code: string) {
  if (!phone || !code) {
    return { ok: false, message: "Phone number and code are required." };
  }

  // Ensure profile exists first
  const profileRes = await getOrCreateProfile();
  if (!profileRes.ok || !profileRes.profile) {
    return { ok: false, message: profileRes.message || "User profile not found." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const result = await verifySmsOtp(phone.trim(), code.trim(), user!.id, supabase);
  return {
    ok: result.success,
    message: result.message,
    phoneVerified: result.success,
  };
}

/**
 * Server Action to submit Payout Verification (KYC) Details
 */
export async function submitKycDetails(formData: {
  legalName: string;
  dob: string;
  idType: string;
  idNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}) {
  // Ensure profile exists first
  const profileRes = await getOrCreateProfile();
  if (!profileRes.ok || !profileRes.profile) {
    return { success: false, message: profileRes.message || "User profile not found." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const adminClient = createAdminClient();
    // Update profile table with Payout details and transition status to pending using admin client
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        identity_legal_name: formData.legalName,
        identity_dob: formData.dob,
        identity_type: formData.idType,
        identity_number: formData.idNumber,
        bank_name: formData.bankName,
        bank_account_number: formData.bankAccountNumber,
        bank_account_name: formData.bankAccountName,
        identity_status: "pending",
      })
      .eq("id", user!.id);

    if (profileError) {
      return { success: false, message: profileError.message };
    }

    return { success: true, message: "Payout verification details successfully submitted for review." };
  } catch (err: any) {
    return { success: false, message: err.message || "An unexpected error occurred submitting payout verification." };
  }
}
