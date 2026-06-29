// src/app/actions/admin.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * Helper to assert active user is an administrator
 */
async function assertAdmin(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Sign in required.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e: string) => e.trim().toLowerCase());
  const isEmailAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

  if (profile?.role !== "admin" && !isEmailAdmin) {
    throw new Error("Unauthorized: Administrator access required.");
  }

  return { adminId: user.id, adminEmail: user.email };
}

/**
 * Admin action to approve or reject user KYC
 */
export async function resolveKyc(userId: string, status: "verified" | "rejected", notes: string) {
  const supabase = await createClient();

  try {
    const { adminId } = await assertAdmin(supabase);

    const { error } = await supabase
      .from("profiles")
      .update({
        identity_status: status,
        admin_notes: notes,
      })
      .eq("id", userId);

    if (error) return { success: false, message: error.message };

    // Record admin audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: adminId,
      action: `kyc_${status}`,
      target_user_id: userId,
      details: { notes },
    });

    return { success: true, message: `KYC successfully resolved as ${status}.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Admin action to resolve payout requests
 */
export async function resolvePayout(requestId: string, status: "completed" | "rejected", notes: string) {
  const supabase = await createClient();

  try {
    const { adminId } = await assertAdmin(supabase);

    // Call atomic payout resolver RPC
    const { error } = await supabase.rpc("resolve_payout_request_atomic", {
      p_request_id: requestId,
      p_admin_id: adminId,
      p_new_status: status,
      p_admin_notes: notes,
    });

    if (error) return { success: false, message: error.message };

    return { success: true, message: `Payout request successfully resolved as ${status}.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Admin action to suspend/activate users
 */
export async function updateUserStatus(userId: string, status: "active" | "suspended" | "under_review", notes: string) {
  const supabase = await createClient();

  try {
    const { adminId } = await assertAdmin(supabase);

    const { error } = await supabase
      .from("profiles")
      .update({
        status,
        admin_notes: notes,
      })
      .eq("id", userId);

    if (error) return { success: false, message: error.message };

    // Record admin audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: adminId,
      action: `user_status_${status}`,
      target_user_id: userId,
      details: { notes },
    });

    return { success: true, message: `User status updated to ${status}.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Admin action to create a challenge round and its 3 matches
 */
export async function createRoundAndMatches(formData: {
  roundNumber: number;
  startDate: string;
  endDate: string;
  matches: Array<{
    homeTeam: string;
    awayTeam: string;
    kickoffTime: string;
    matchday: number;
  }>;
}) {
  const supabase = await createClient();

  try {
    await assertAdmin(supabase); // destructure not needed; we only need the gate

    // 1. Create Challenge Round
    const { data: round, error: roundError } = await supabase
      .from("challenge_rounds")
      .insert({
        round_number: formData.roundNumber,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: "upcoming",
      })
      .select()
      .single();

    if (roundError || !round) {
      return { success: false, message: "Round creation failed: " + (roundError?.message || "Unknown error") };
    }

    // 2. Insert the 3 Matches
    const matchInserts = formData.matches.map((m) => ({
      round_id: round.id,
      home_team: m.homeTeam,
      away_team: m.awayTeam,
      kickoff_time: m.kickoffTime,
      status: "scheduled",
      matchday: m.matchday,
    }));

    const { error: matchesError } = await supabase
      .from("challenge_matches")
      .insert(matchInserts);

    if (matchesError) {
      return { success: false, message: "Match creation failed: " + matchesError.message };
    }

    return { success: true, message: `Challenge Round #${formData.roundNumber} and matches successfully created.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Admin action to input scores and settle round winners
 */
export async function settleChallengeRound(
  roundId: string,
  matchResults: Array<{ matchId: string; homeScore: number; awayScore: number }>
) {
  const supabase = await createClient();

  try {
    const { adminId } = await assertAdmin(supabase);

    // 1. Update Match Scores & statuses
    for (const res of matchResults) {
      const { error: matchError } = await supabase
        .from("challenge_matches")
        .update({
          home_score: res.homeScore,
          away_score: res.awayScore,
          status: "finished",
        })
        .eq("id", res.matchId);

      if (matchError) return { success: false, message: `Failed to update match scores: ${matchError.message}` };
    }

    // 2. Evaluate all predictions in the round
    // Fetch all matches in the round
    const { data: matches } = await supabase
      .from("challenge_matches")
      .select("*")
      .eq("round_id", roundId);

    if (!matches) return { success: false, message: "No matches found in round." };

    // Fetch all predictions in the round
    const { data: predictions } = await supabase
      .from("predictions")
      .select(`
        id,
        entry_id,
        match_id,
        prediction
      `)
      .in("match_id", matches.map((m) => m.id));

    if (predictions) {
      // Mark predictions as correct/incorrect
      for (const pred of predictions) {
        const match = matches.find((m) => m.id === pred.match_id);
        if (match) {
          const outcome =
            match.home_score > match.away_score
              ? "1"
              : match.home_score < match.away_score
              ? "2"
              : "X";
          
          const isCorrect = pred.prediction === outcome;

          await supabase
            .from("predictions")
            .update({ is_correct: isCorrect, is_locked: true })
            .eq("id", pred.id);
        }
      }
    }

    // 3. Find entries with 3/3 correct predictions and route to winner queue
    const { data: entries } = await supabase
      .from("challenge_entries")
      .select("id, user_id")
      .eq("round_id", roundId);

    if (entries) {
      for (const entry of entries) {
        // Fetch predictions for this entry
        const { data: entryPreds } = await supabase
          .from("predictions")
          .select("is_correct")
          .eq("entry_id", entry.id);

        if (entryPreds && entryPreds.length === 3 && entryPreds.every((p) => p.is_correct === true)) {
          // Trigger atomic round winner RPC (verified = false queue)
          await supabase.rpc("settle_round_winner_atomic", {
            p_entry_id: entry.id,
            p_admin_id: adminId,
          });
        }
      }
    }

    // 4. Update round status to completed
    await supabase
      .from("challenge_rounds")
      .update({ status: "completed" })
      .eq("id", roundId);

    return { success: true, message: "Challenge round successfully settled and winners routed to the queue." };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Admin action to verify a winner (credits wallet)
 */
export async function approveWinner(winnerId: string) {
  const supabase = await createClient();

  try {
    const { adminId } = await assertAdmin(supabase);

    const { error } = await supabase.rpc("approve_winner_atomic", {
      p_winner_id: winnerId,
      p_admin_id: adminId,
    });

    if (error) return { success: false, message: error.message };

    return { success: true, message: "Winner payout approved and credited to wallet ledger." };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// DEMO USER MANAGEMENT ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Admin action: Create a demo/test user with profile, wallet, and optional seed balance.
 * Demo users are marked with status='demo' and can never be admin.
 */
export async function createDemoUser(formData: {
  email?: string;
  username?: string;
  phone?: string;
  phoneVerified?: boolean;
  startingBalance?: number;
}) {
  const supabase = await createClient();

  try {
    const { adminId, adminEmail } = await assertAdmin(supabase);
    const adminClient = createAdminClient();

    // Generate safe demo email and username if not provided
    const timestamp = Date.now();
    const demoEmail = formData.email || `demo+${timestamp}@nanoplay.test`;
    const demoUsername = formData.username || `demo_user_${timestamp}`;
    const demoPhone = formData.phone || `+234800${timestamp.toString().slice(-7)}`;
    const startBal = Math.max(0, formData.startingBalance || 0);

    // 1. Create auth user via admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: demoEmail,
      email_confirm: true,
      password: `DemoPass_${crypto.randomBytes(6).toString("hex")}`,
      user_metadata: { is_demo: true },
    });

    if (authError || !authData.user) {
      return { ok: false, message: `Auth user creation failed: ${authError?.message || "Unknown error"}` };
    }

    const userId = authData.user.id;

    // 2. Create profile row with status='demo'
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: userId,
        username: demoUsername,
        phone: demoPhone,
        normalized_phone: demoPhone,
        phone_verified: formData.phoneVerified || false,
        role: "user",
        status: "demo",
      });

    if (profileError) {
      // Rollback: delete the auth user
      await adminClient.auth.admin.deleteUser(userId);
      return { ok: false, message: `Profile creation failed: ${profileError.message}` };
    }

    // 3. Create wallet row
    const { data: walletData, error: walletError } = await adminClient
      .from("wallets")
      .insert({ user_id: userId, balance_ngn: 0 })
      .select("id")
      .single();

    if (walletError || !walletData) {
      return { ok: false, message: `Wallet creation failed: ${walletError?.message || "Unknown error"}` };
    }

    // 4. If starting balance > 0, create an audited seed transaction
    if (startBal > 0) {
      const ref = `demo_seed_${userId.slice(0, 8)}_${timestamp}`;
      await adminClient.from("wallet_transactions").insert({
        wallet_id: walletData.id,
        amount: startBal,
        type: "admin_adjustment",
        reference: ref,
        status: "confirmed",
      });
    }

    // 5. Audit log
    await adminClient.from("admin_audit_logs").insert({
      admin_id: adminId,
      action: "demo_user_created",
      target_user_id: userId,
      details: {
        email: demoEmail,
        username: demoUsername,
        starting_balance: startBal,
        admin_email: adminEmail,
      },
    });

    return {
      ok: true,
      message: `Demo user created: ${demoUsername} (${demoEmail})`,
      userId,
      email: demoEmail,
      username: demoUsername,
    };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

/**
 * Admin action: Credit or debit a user's wallet through an audited ledger transaction.
 * Prevents negative balances. Stores admin email and reason in the audit log.
 */
export async function adjustWalletBalance(formData: {
  userId: string;
  amount: number;
  reason: string;
  type: "credit" | "debit";
}) {
  const supabase = await createClient();

  try {
    const { adminId, adminEmail } = await assertAdmin(supabase);
    const adminClient = createAdminClient();

    const { userId, reason, type } = formData;
    const rawAmount = Math.abs(formData.amount);

    if (rawAmount <= 0) {
      return { ok: false, message: "Amount must be greater than zero." };
    }
    if (!reason || reason.trim().length < 3) {
      return { ok: false, message: "A reason/note is required for wallet adjustments." };
    }

    // Fetch wallet
    const { data: wallet, error: walletError } = await adminClient
      .from("wallets")
      .select("id, balance_ngn")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return { ok: false, message: "Wallet not found for this user." };
    }

    // Prevent negative balance on debit
    const ledgerAmount = type === "credit" ? rawAmount : -rawAmount;
    if (type === "debit" && wallet.balance_ngn < rawAmount) {
      return {
        ok: false,
        message: `Insufficient balance. Current: NGN ${wallet.balance_ngn.toLocaleString()}, Requested debit: NGN ${rawAmount.toLocaleString()}.`,
      };
    }

    // Create audited ledger transaction
    const ref = `admin_adj_${userId.slice(0, 8)}_${Date.now()}`;
    const { error: txError } = await adminClient.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount: ledgerAmount,
      type: "admin_adjustment",
      reference: ref,
      status: "confirmed",
    });

    if (txError) {
      return { ok: false, message: `Transaction failed: ${txError.message}` };
    }

    // Audit log
    await adminClient.from("admin_audit_logs").insert({
      admin_id: adminId,
      action: `wallet_${type}`,
      target_user_id: userId,
      details: {
        amount: rawAmount,
        type,
        reason,
        reference: ref,
        admin_email: adminEmail,
        balance_before: wallet.balance_ngn,
        balance_after: wallet.balance_ngn + ledgerAmount,
      },
    });

    return {
      ok: true,
      message: `Wallet ${type} of NGN ${rawAmount.toLocaleString()} applied successfully.`,
      balanceBefore: wallet.balance_ngn,
      balanceAfter: wallet.balance_ngn + ledgerAmount,
    };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

/**
 * Admin action: Toggle phone_verified status for a user (primarily demo users).
 */
export async function togglePhoneVerified(userId: string, verified: boolean) {
  const supabase = await createClient();

  try {
    const { adminId, adminEmail } = await assertAdmin(supabase);
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("profiles")
      .update({ phone_verified: verified })
      .eq("id", userId);

    if (error) return { ok: false, message: error.message };

    await adminClient.from("admin_audit_logs").insert({
      admin_id: adminId,
      action: verified ? "phone_verified_set" : "phone_verified_cleared",
      target_user_id: userId,
      details: { admin_email: adminEmail },
    });

    return { ok: true, message: `Phone verification ${verified ? "enabled" : "cleared"} for user.` };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

/**
 * Admin action: Reset a demo user's wallet to zero through a debit ledger transaction.
 * Only works on users with status='demo'.
 */
export async function resetDemoWallet(userId: string) {
  const supabase = await createClient();

  try {
    const { adminId, adminEmail } = await assertAdmin(supabase);
    const adminClient = createAdminClient();

    // Verify this is a demo user
    const { data: profile } = await adminClient
      .from("profiles")
      .select("status")
      .eq("id", userId)
      .single();

    if (profile?.status !== "demo") {
      return { ok: false, message: "Wallet reset is only available for demo users." };
    }

    // Get wallet
    const { data: wallet } = await adminClient
      .from("wallets")
      .select("id, balance_ngn")
      .eq("user_id", userId)
      .single();

    if (!wallet) {
      return { ok: false, message: "Wallet not found." };
    }

    if (wallet.balance_ngn === 0) {
      return { ok: true, message: "Wallet is already at zero." };
    }

    // Debit entire balance through ledger
    const ref = `demo_reset_${userId.slice(0, 8)}_${Date.now()}`;
    await adminClient.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount: -wallet.balance_ngn,
      type: "admin_adjustment",
      reference: ref,
      status: "confirmed",
    });

    await adminClient.from("admin_audit_logs").insert({
      admin_id: adminId,
      action: "demo_wallet_reset",
      target_user_id: userId,
      details: { previous_balance: wallet.balance_ngn, admin_email: adminEmail },
    });

    return { ok: true, message: `Demo wallet reset from NGN ${wallet.balance_ngn.toLocaleString()} to NGN 0.` };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

/**
 * Admin action: Delete a demo user. ONLY allows deletion of profiles with status='demo'.
 * Requires confirmation string 'DELETE DEMO USER' to prevent accidental deletion.
 * Real users (status != 'demo') can NEVER be deleted through this action.
 */
export async function deleteDemoUser(userId: string, confirmationString: string) {
  const supabase = await createClient();

  try {
    const { adminId, adminEmail } = await assertAdmin(supabase);
    const adminClient = createAdminClient();

    // Safety gate: require exact confirmation string
    if (confirmationString !== "DELETE DEMO USER") {
      return { ok: false, message: "Confirmation failed. Type 'DELETE DEMO USER' exactly to proceed." };
    }

    // Verify this is a demo user — CRITICAL SAFETY CHECK
    const { data: profile } = await adminClient
      .from("profiles")
      .select("status, username, role")
      .eq("id", userId)
      .single();

    if (!profile) {
      return { ok: false, message: "User not found." };
    }

    if (profile.status !== "demo") {
      return { ok: false, message: "BLOCKED: Only demo users can be deleted. This user has status '" + profile.status + "'." };
    }

    if (profile.role === "admin") {
      return { ok: false, message: "BLOCKED: Cannot delete an admin account through demo tools." };
    }

    const deletedUsername = profile.username;

    // Audit log BEFORE deletion
    await adminClient.from("admin_audit_logs").insert({
      admin_id: adminId,
      action: "demo_user_deleted",
      target_user_id: userId,
      details: { username: deletedUsername, admin_email: adminEmail },
    });

    // Delete auth user (cascades to profile, wallet, transactions)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return { ok: false, message: `Deletion failed: ${deleteError.message}` };
    }

    return { ok: true, message: `Demo user '${deletedUsername}' has been permanently deleted.` };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}
