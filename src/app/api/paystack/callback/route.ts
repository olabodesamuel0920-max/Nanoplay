// src/app/api/paystack/callback/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  const originUrl = request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${originUrl}/wallet?status=failed&message=Missing+reference`);
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch transaction record by reference
    const { data: tx, error: txError } = await adminClient
      .from("wallet_transactions")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (txError || !tx) {
      return NextResponse.redirect(`${originUrl}/wallet?status=failed&message=Transaction+not+found`);
    }

    // 2. Prevent duplicate processing
    if (tx.status === "confirmed") {
      return NextResponse.redirect(`${originUrl}/wallet?status=success`);
    }

    // 3. Call Paystack verify API
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.redirect(`${originUrl}/wallet?status=failed&message=Secret+key+missing`);
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok || !verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.redirect(`${originUrl}/wallet?status=failed&message=Verification+failed`);
    }

    // 4. Validate amount matches (Paystack amount is in kobo subunit)
    const paystackAmountNgn = verifyData.data.amount / 100;
    if (paystackAmountNgn !== tx.amount) {
      // Amount mismatch, flag as rejected
      await adminClient
        .from("wallet_transactions")
        .update({ status: "rejected" })
        .eq("id", tx.id);

      return NextResponse.redirect(`${originUrl}/wallet?status=failed&message=Amount+mismatch`);
    }

    // 5. Update status to confirmed. DB triggers will recalculate user balance.
    const { error: updateError } = await adminClient
      .from("wallet_transactions")
      .update({ status: "confirmed" })
      .eq("id", tx.id);

    if (updateError) {
      return NextResponse.redirect(`${originUrl}/wallet?status=failed&message=Ledger+update+failed`);
    }

    return NextResponse.redirect(`${originUrl}/wallet?status=success`);
  } catch (err: any) {
    return NextResponse.redirect(`${originUrl}/wallet?status=failed&message=${encodeURIComponent(err.message || "Unknown error")}`);
  }
}
