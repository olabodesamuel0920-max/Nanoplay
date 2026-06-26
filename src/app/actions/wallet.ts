// src/app/actions/wallet.ts
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action to trigger a deposit (Simulating Paystack reference validation)
 */
export async function triggerDeposit(amount: number, reference: string) {
  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than zero." };
  }

  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    // Fetch user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return { success: false, message: "Wallet not found." };
    }

    // Insert a confirmed deposit transaction into the ledger
    // The database trigger trg_sync_wallet_balance will automatically credit the wallet's balance
    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        amount: amount,
        type: "deposit",
        reference: reference || `dep_${Math.random().toString(36).substr(2, 9)}`,
        status: "confirmed",
      });

    if (txError) {
      return { success: false, message: txError.message };
    }

    return { success: true, message: "Deposit completed and wallet balance credited." };
  } catch (err: any) {
    return { success: false, message: err.message || "An unexpected error occurred during deposit." };
  }
}

/**
 * Server Action to trigger a withdrawal (Payout request)
 */
export async function triggerWithdrawal(amount: number, bankInfo: {
  bankName: string;
  accountNumber: string;
  accountName: string;
}) {
  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than zero." };
  }

  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    // Call database atomic function to validate and request payout
    const { error } = await supabase.rpc("create_payout_request_atomic", {
      p_user_id: user.id,
      p_amount: amount,
      p_bank_info: {
        bank_name: bankInfo.bankName,
        account_number: bankInfo.accountNumber,
        account_name: bankInfo.accountName,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Payout request successfully created and queued for admin review." };
  } catch (err: any) {
    return { success: false, message: err.message || "An unexpected error occurred during payout request." };
  }
}
