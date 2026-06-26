// tmp/qa_functional_test.js
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Unique prefix for this test run to prevent collisions and support easy cleanup
const testPrefix = `qa_test_${Math.random().toString(36).substr(2, 6)}`;
const testUsers = [];

async function runQA() {
  console.log("Starting NanoPlay Functional QA Test Suite...");

  try {
    // 1. CREATE TEST USERS VIA AUTH ADMIN
    console.log("\n1. Provisioning Test Users...");
    
    const userEmails = [
      `${testPrefix}_user_a@nanoplay.com`,
      `${testPrefix}_user_b@nanoplay.com`
    ];

    for (let i = 0; i < userEmails.length; i++) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: userEmails[i],
        password: "password123",
        email_confirm: true,
        user_metadata: {
          full_name: `QA User ${i === 0 ? "A" : "B"}`,
          username: `${testPrefix}_user_${i === 0 ? "a" : "b"}`
        }
      });

      if (error) throw new Error(`Failed to create test user: ${error.message}`);
      testUsers.push(data.user);
      console.log(`   ✓ Provisioned user: ${userEmails[i]} (ID: ${data.user.id})`);
    }

    const userA = testUsers[0];
    const userB = testUsers[1];

    // 2. TEST: PHONE OTP & DUPLICATE PHONE UNIQUE CONSTRAINT
    console.log("\n2. Testing Phone Normalization and Duplicate Uniqueness...");
    
    // Update User A phone (Nigeria local format)
    const { error: phoneErrorA } = await supabase
      .from("profiles")
      .update({ phone: "08012345678" })
      .eq("id", userA.id);

    if (phoneErrorA) throw new Error(`Failed to set User A phone: ${phoneErrorA.message}`);

    // Verify User A normalized phone is correct
    const { data: profileA } = await supabase
      .from("profiles")
      .select("normalized_phone")
      .eq("id", userA.id)
      .single();

    if (profileA.normalized_phone !== "2348012345678") {
      throw new Error(`Phone normalization failed. Expected 2348012345678, got: ${profileA.normalized_phone}`);
    }
    console.log("   ✓ User A phone successfully normalized to 2348012345678.");

    // Attempt to update User B to the same phone number (international format)
    // The unique constraint on normalized_phone should block this
    const { error: phoneErrorB } = await supabase
      .from("profiles")
      .update({ phone: "+2348012345678" })
      .eq("id", userB.id);

    if (!phoneErrorB) {
      throw new Error("Duplicate normalized phone number was allowed! Uniqueness constraint FAILED.");
    }
    console.log("   ✓ Duplicate phone constraint successfully blocked second registration.");


    // 3. TEST: DUPLICATE BANK TRIGGER FLAGS BOTH
    console.log("\n3. Testing Duplicate Bank Account Flagging Trigger...");
    
    // Set User A bank details
    const { error: bankErrorA } = await supabase
      .from("profiles")
      .update({
        bank_name: "Test Bank",
        bank_account_number: "0123456789",
        bank_account_name: "QA User A Payout"
      })
      .eq("id", userA.id);

    if (bankErrorA) throw new Error(`Failed to set User A bank: ${bankErrorA.message}`);

    // Set User B bank details to the same account number
    // This should trigger bank_account_flagged on both
    const { error: bankErrorB } = await supabase
      .from("profiles")
      .update({
        bank_name: "Test Bank",
        bank_account_number: "0123456789",
        bank_account_name: "QA User B Payout"
      })
      .eq("id", userB.id);

    if (bankErrorB) throw new Error(`Failed to set User B bank: ${bankErrorB.message}`);

    // Fetch both profiles to check flag status
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, bank_account_flagged, bank_account_flagged_reason, status")
      .in("id", [userA.id, userB.id]);

    const uA = profiles.find(p => p.id === userA.id);
    const uB = profiles.find(p => p.id === userB.id);

    if (!uA.bank_account_flagged || !uB.bank_account_flagged) {
      throw new Error("Duplicate bank trigger failed to flag both accounts.");
    }
    if (uA.status !== "under_review" || uB.status !== "under_review") {
      throw new Error("Duplicate bank trigger failed to set user status to under_review.");
    }
    console.log("   ✓ Duplicate bank details successfully flagged both accounts and set status to under_review.");


    // 4. TEST: KYC PAYOUT GATE RPC
    console.log("\n4. Testing KYC Payout Gate RPC...");

    // Fund User A wallet first (direct ledger deposit)
    const { data: walletA } = await supabase.from("wallets").select("id").eq("user_id", userA.id).single();
    await supabase.from("wallet_transactions").insert({
      wallet_id: walletA.id,
      amount: 10000,
      type: "deposit",
      reference: `${testPrefix}_dep_1`,
      status: "confirmed"
    });

    // Verify wallet balance is ₦10,000
    const { data: fundedWalletA } = await supabase.from("wallets").select("balance_ngn").eq("id", walletA.id).single();
    if (fundedWalletA.balance_ngn !== 10000) {
      throw new Error(`Funding wallet failed. Expected balance 10000, got: ${fundedWalletA.balance_ngn}`);
    }
    console.log("   ✓ Funded User A wallet ledger with ₦10,000.");

    // Attempt payout request of ₦5,000 with unverified KYC
    // Should throw exception from create_payout_request_atomic
    const { error: payoutError1 } = await supabase.rpc("create_payout_request_atomic", {
      p_user_id: userA.id,
      p_amount: 5000,
      p_bank_info: { bank_name: "Test Bank", account_number: "0123456789", account_name: "QA User A Payout" }
    });

    if (!payoutError1) {
      throw new Error("Payout request allowed with unverified KYC! Gate constraint FAILED.");
    }
    console.log("   ✓ KYC Payout Gate successfully rejected request for unverified account.");

    // Verify phone OTP status and clear bank flags to test successful gate bypass
    await supabase
      .from("profiles")
      .update({
        phone_verified: true,
        identity_status: "verified",
        bank_account_flagged: false,
        status: "active"
      })
      .eq("id", userA.id);

    // Re-attempt payout request of ₦5,000 (should succeed)
    const { error: payoutError2 } = await supabase.rpc("create_payout_request_atomic", {
      p_user_id: userA.id,
      p_amount: 5000,
      p_bank_info: { bank_name: "Test Bank", account_number: "0123456789", account_name: "QA User A Payout" }
    });

    if (payoutError2) {
      throw new Error(`Payout request failed on verified account: ${payoutError2.message}`);
    }

    // Verify User A wallet balance is now ₦5,000
    const { data: updatedWalletA } = await supabase.from("wallets").select("balance_ngn").eq("id", walletA.id).single();
    if (updatedWalletA.balance_ngn !== 5000) {
      throw new Error(`Payout balance deduction failed. Expected balance 5000, got: ${updatedWalletA.balance_ngn}`);
    }
    console.log("   ✓ KYC Payout Gate successfully approved request. Balance deducted to ₦5,000.");


    // 5. TEST: WINNER REVIEW QUEUE & ATOMIC APPROVAL
    console.log("\n5. Testing Winner Review Queue and Atomic Approval...");

    // Create active round
    const { data: round, error: roundErr } = await supabase
      .from("challenge_rounds")
      .insert({
        round_number: 9999, // High round number to prevent collisions
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 24*60*60*1000).toISOString(),
        status: "active"
      })
      .select()
      .single();

    if (roundErr) throw new Error(`Failed to create round: ${roundErr.message}`);

    // Create 3 matches for round
    const { data: matches, error: matchesErr } = await supabase
      .from("challenge_matches")
      .insert([
        { round_id: round.id, home_team: "Team A", away_team: "Team B", kickoff_time: new Date(Date.now() + 2*60*60*1000).toISOString(), status: "scheduled", matchday: 1 },
        { round_id: round.id, home_team: "Team C", away_team: "Team D", kickoff_time: new Date(Date.now() + 4*60*60*1000).toISOString(), status: "scheduled", matchday: 2 },
        { round_id: round.id, home_team: "Team E", away_team: "Team F", kickoff_time: new Date(Date.now() + 6*60*60*1000).toISOString(), status: "scheduled", matchday: 3 }
      ])
      .select();

    if (matchesErr) throw new Error(`Failed to create matches: ${matchesErr.message}`);

    // Fetch Standard Tier ID
    const { data: tier } = await supabase.from("account_tiers").select("id").eq("name", "Standard").single();

    // Create challenge entry for User A
    const { data: entry, error: entryErr } = await supabase
      .from("challenge_entries")
      .insert({
        user_id: userA.id,
        round_id: round.id,
        tier_id: tier.id,
        streak_count: 0
      })
      .select()
      .single();

    if (entryErr) throw new Error(`Failed to create entry: ${entryErr.message}`);

    // Submit 3 correct predictions
    await supabase.from("predictions").insert([
      { entry_id: entry.id, match_id: matches[0].id, prediction: "1" },
      { entry_id: entry.id, match_id: matches[1].id, prediction: "1" },
      { entry_id: entry.id, match_id: matches[2].id, prediction: "1" }
    ]);

    // Settle matches (all Home Win)
    await supabase.from("challenge_matches").update({ home_score: 2, away_score: 0, status: "finished" }).eq("id", matches[0].id);
    await supabase.from("challenge_matches").update({ home_score: 2, away_score: 0, status: "finished" }).eq("id", matches[1].id);
    await supabase.from("challenge_matches").update({ home_score: 2, away_score: 0, status: "finished" }).eq("id", matches[2].id);

    // Update predictions correct flags and route winner
    // In production, the admin settles this. Let's simulate the winner route via the RPC settle_round_winner_atomic
    // Ensure we mark the admin profile as admin
    await supabase.from("profiles").update({ role: "admin" }).eq("id", userB.id); // Set User B as admin for this test

    const { error: settleErr } = await supabase.rpc("settle_round_winner_atomic", {
      p_entry_id: entry.id,
      p_admin_id: userB.id
    });

    if (settleErr) throw new Error(`Failed to route winner: ${settleErr.message}`);

    // Verify winner entry is in winners table with verified = false
    const { data: winner, error: winnerErr } = await supabase
      .from("winners")
      .select("*")
      .eq("user_id", userA.id)
      .eq("round_id", round.id)
      .single();

    if (winnerErr || !winner) throw new Error("Winner record not found in review queue.");
    if (winner.verified !== false) throw new Error("Winner was verified automatically! Queue constraint FAILED.");
    console.log("   ✓ Winner successfully routed to Manual Review Queue (verified = false).");

    // Admin approves winner payout
    const { error: approveErr } = await supabase.rpc("approve_winner_atomic", {
      p_winner_id: winner.id,
      p_admin_id: userB.id
    });

    if (approveErr) throw new Error(`Failed to approve winner payout: ${approveErr.message}`);

    // Verify winner is now verified = true
    const { data: verifiedWinner } = await supabase.from("winners").select("verified").eq("id", winner.id).single();
    if (verifiedWinner.verified !== true) throw new Error("Winner verification status update FAILED.");

    // Verify User A wallet balance is credited with 10X Standard Tier price (₦100,000)
    // Wallet started with ₦5,000 (after withdrawal). Correct balance should be ₦105,000
    const { data: finalWalletA } = await supabase.from("wallets").select("balance_ngn").eq("id", walletA.id).single();
    if (finalWalletA.balance_ngn !== 105000) {
      throw new Error(`Winner reward credit failed. Expected balance 105000, got: ${finalWalletA.balance_ngn}`);
    }
    console.log("   ✓ Winner payout approved. Wallet credited with ₦100,000. Balance is now ₦105,000.");


    console.log("\n✓ All NanoPlay Functional QA Tests PASSED successfully.");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ NanoPlay Functional QA Test FAILED:", err.message);
    process.exit(1);

  } finally {
    // 6. ABSOLUTE CLEANUP IN FINALLY BLOCK
    console.log("\n6. Cleaning up all test records...");
    
    if (testUsers.length > 0) {
      for (const u of testUsers) {
        // Deleting the user from auth.users triggers CASCADE delete on public.profiles
        // and all linked records (wallets, transactions, entries, predictions, winners, etc.)
        const { error } = await supabase.auth.admin.deleteUser(u.id);
        if (error) {
          console.error(`   ⚠️ Failed to delete test user ${u.email}:`, error.message);
        } else {
          console.log(`   ✓ Cleaned up test user and cascading data: ${u.email}`);
        }
      }
    }

    // Clean up temporary round if created
    const { data: tempRounds } = await supabase.from("challenge_rounds").select("id").eq("round_number", 9999);
    if (tempRounds && tempRounds.length > 0) {
      for (const r of tempRounds) {
        await supabase.from("challenge_rounds").delete().eq("id", r.id);
        console.log("   ✓ Cleaned up test challenge round #9999.");
      }
    }
  }
}

runQA();
