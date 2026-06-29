// src/app/api/paystack/initialize/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Get authenticated user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, message: "Unauthorized. Please sign in." }, { status: 401 });
  }

  // 2. Read and validate wallet funding enabled status from platform_settings
  const { data: settingData } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "wallet_funding_enabled")
    .maybeSingle();

  const dbFundingEnabled = settingData ? JSON.parse(settingData.value) : false;
  const envFundingEnabled = (process.env.WALLET_FUNDING_ENABLED === "true") || (process.env.NEXT_PUBLIC_WALLET_FUNDING_ENABLED === "true");
  if (!dbFundingEnabled && !envFundingEnabled) {
    return NextResponse.json({ success: false, message: "Funding is currently in launch review." }, { status: 403 });
  }

  // 3. Read body inputs
  let amount: number;
  try {
    const body = await request.json();
    amount = Number(body.amount);
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON input." }, { status: 400 });
  }

  // 4. Enforce permitted deposit amounts (Starter: 5k, Standard: 10k, Premium: 20k)
  const allowedAmounts = [5000, 10000, 20000];
  if (!allowedAmounts.includes(amount)) {
    return NextResponse.json({ success: false, message: "Allowed deposit amounts are NGN 5,000, NGN 10,000, or NGN 20,000." }, { status: 400 });
  }

  const adminClient = createAdminClient();

  try {
    // 5. Get user wallet
    const { data: wallet, error: walletError } = await adminClient
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ success: false, message: "Wallet not found for this user." }, { status: 404 });
    }

    // 6. Generate unique internal transaction reference
    const reference = `nanoplay_deposit_${crypto.randomUUID()}`;

    // 7. Store pending transaction record in ledger before redirecting
    const { error: txError } = await adminClient
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        amount, // positive credit value
        type: "deposit",
        reference,
        status: "pending",
      });

    if (txError) {
      return NextResponse.json({ success: false, message: "Failed to initialize ledger transaction: " + txError.message }, { status: 500 });
    }

    // 8. Call Paystack API to initialize payment
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ success: false, message: "Paystack secret key is missing in server environment." }, { status: 500 });
    }

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100, // amount in kobo
        reference,
        callback_url: process.env.PAYSTACK_CALLBACK_URL || `${request.nextUrl.origin}/api/paystack/callback`,
      }),
    });

    const paystackData = await paystackResponse.json();
    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json({ success: false, message: paystackData.message || "Failed to initialize payment with Paystack." }, { status: 502 });
    }

    // 9. Return authorization checkout URL
    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "An unexpected error occurred during initialization." }, { status: 500 });
  }
}
