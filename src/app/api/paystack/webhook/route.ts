// src/app/api/paystack/webhook/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return NextResponse.json({ success: false, message: "Webhook key missing on server." }, { status: 500 });
  }

  // 1. Read raw body text for signature validation
  const rawBody = await request.text();

  // 2. Validate Paystack Signature
  const signature = request.headers.get("x-paystack-signature");
  if (!signature) {
    return NextResponse.json({ success: false, message: "Missing signature header." }, { status: 401 });
  }

  const hash = crypto
    .createHmac("sha512", paystackSecret)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ success: false, message: "Signature verification failed." }, { status: 401 });
  }

  // 3. Signature is valid, parse body
  let eventData: any;
  try {
    eventData = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  // 4. Process event
  if (eventData.event === "charge.success") {
    const data = eventData.data;
    const reference = data.reference;
    const paystackAmountNgn = data.amount / 100; // Paystack is in kobo subunit

    const adminClient = createAdminClient();

    try {
      // 5. Fetch ledger transaction
      const { data: tx, error: txError } = await adminClient
        .from("wallet_transactions")
        .select("*")
        .eq("reference", reference)
        .maybeSingle();

      if (txError || !tx) {
        // Return 200 for missing references so Paystack does not retry endlessly
        return NextResponse.json({ status: "ignored", message: "Transaction reference not found." }, { status: 200 });
      }

      // 6. Check duplicate execution
      if (tx.status === "confirmed") {
        return NextResponse.json({ status: "success", message: "Transaction already confirmed." }, { status: 200 });
      }

      // 7. Validate amount matches
      if (paystackAmountNgn !== tx.amount) {
        await adminClient
          .from("wallet_transactions")
          .update({ status: "rejected" })
          .eq("id", tx.id);

        return NextResponse.json({ status: "failed", message: "Amount mismatch detected." }, { status: 200 });
      }

      // 8. Update status to confirmed. Balance is automatically synced by DB triggers.
      const { error: updateError } = await adminClient
        .from("wallet_transactions")
        .update({ status: "confirmed" })
        .eq("id", tx.id);

      if (updateError) {
        return NextResponse.json({ status: "error", message: "Failed to confirm ledger transaction: " + updateError.message }, { status: 500 });
      }

      return NextResponse.json({ status: "success", message: "Transaction confirmed." }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ status: "error", message: err.message || "Unknown error during transaction processing." }, { status: 500 });
    }
  }

  // Return 200 for other unhandled events so Paystack does not retry
  return NextResponse.json({ status: "ignored" }, { status: 200 });
}
