// src/app/actions/verification.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { sendOtp as sendSmsOtp, verifyOtp as verifySmsOtp } from "@/lib/sms";

/**
 * Server Action to trigger sending a phone OTP verification code
 */
export async function triggerSendOtp(phone: string) {
  if (!phone || phone.trim() === "") {
    return { success: false, message: "Phone number is required." };
  }

  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  // Generate and send OTP via SMS abstraction
  const result = await sendSmsOtp(phone.trim(), supabase);
  return result;
}

/**
 * Server Action to verify a phone OTP code
 */
export async function triggerVerifyOtp(phone: string, code: string) {
  if (!phone || !code) {
    return { success: false, message: "Phone number and code are required." };
  }

  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const result = await verifySmsOtp(phone.trim(), code.trim(), user.id, supabase);
  return result;
}

/**
 * Server Action to submit KYC Details
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
  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    // Update profile table with KYC details and transition status to pending
    const { error: profileError } = await supabase
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
      .eq("id", user.id);

    if (profileError) {
      return { success: false, message: profileError.message };
    }

    return { success: true, message: "KYC details successfully submitted for review." };
  } catch (err: any) {
    return { success: false, message: err.message || "An unexpected error occurred submitting KYC." };
  }
}
