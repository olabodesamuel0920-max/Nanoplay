// src/app/actions/admin.ts
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Helper to assert active user is an administrator
 */
async function assertAdmin(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Sign in required.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const isEmailAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

  if (profile?.role !== "admin" && !isEmailAdmin) {
    throw new Error("Unauthorized: Administrator access required.");
  }

  return user.id;
}

/**
 * Admin action to approve or reject user KYC
 */
export async function resolveKyc(userId: string, status: "verified" | "rejected", notes: string) {
  const supabase = await createClient();

  try {
    const adminId = await assertAdmin(supabase);

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
    const adminId = await assertAdmin(supabase);

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
    const adminId = await assertAdmin(supabase);

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
    await assertAdmin(supabase);

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
    const adminId = await assertAdmin(supabase);

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
    const adminId = await assertAdmin(supabase);

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
