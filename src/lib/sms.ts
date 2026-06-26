// src/lib/sms.ts

type OtpMode = "mock" | "termii" | "twilio";

interface SendOtpResult {
  success: boolean;
  message: string;
  code?: string; // Only returned in mock mode
}

/**
 * Clean independent SMS OTP service abstraction
 * Supports Termii, Twilio, and Mock modes.
 */
export async function sendOtp(
  phone: string,
  supabaseClient: any
): Promise<SendOtpResult> {
  const mode = (process.env.OTP_MODE || "mock") as OtpMode;
  
  // 1. Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  try {
    // 2. Save code to database phone_verification_codes table
    const { error } = await supabaseClient
      .from("phone_verification_codes")
      .insert({
        phone,
        code,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        verified: false,
      });

    if (error) {
      return { success: false, message: "Database registration failed: " + error.message };
    }

    // 3. Dispatch SMS based on active mode
    if (mode === "mock") {
      console.log(`[MOCK OTP] Verification code for ${phone} is: ${code}`);
      return { success: true, message: "Mock OTP sent successfully.", code };
    }

    if (mode === "termii") {
      const apiKey = process.env.TERMII_API_KEY;
      const senderId = process.env.TERMII_SENDER_ID || "NanoPlay";
      const termiiUrl = "https://api.ng.termii.com/api/sms/send";

      if (!apiKey) {
        return { success: false, message: "Termii API key is not configured." };
      }

      const response = await fetch(termiiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          from: senderId,
          sms: `Your NanoPlay verification code is: ${code}. Valid for 10 minutes.`,
          type: "plain",
          channel: "dnd",
          api_key: apiKey,
        }),
      });

      const data = await response.json();
      if (response.ok && data.code === "ok") {
        return { success: true, message: "OTP sent via Termii." };
      } else {
        return { success: false, message: data.message || "Termii API delivery error." };
      }
    }

    if (mode === "twilio") {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        return { success: false, message: "Twilio credentials are not configured." };
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: authHeader,
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: `Your NanoPlay verification code is: ${code}. Valid for 10 minutes.`,
        }).toString(),
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, message: "OTP sent via Twilio." };
      } else {
        return { success: false, message: data.message || "Twilio API delivery error." };
      }
    }

    return { success: false, message: "Unsupported OTP mode." };
  } catch (err: any) {
    return { success: false, message: err.message || "An unexpected error occurred sending OTP." };
  }
}

/**
 * Verifies an OTP code and updates the user profile status
 */
export async function verifyOtp(
  phone: string,
  code: string,
  userId: string,
  supabaseClient: any
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Query matching, unexpired, unverified code
    const { data: record, error } = await supabaseClient
      .from("phone_verification_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !record) {
      // Increment attempts for recent code
      await supabaseClient.rpc("increment_otp_attempts", { p_phone: phone });
      return { success: false, message: "Invalid or expired verification code." };
    }

    // 2. Mark code as verified
    await supabaseClient
      .from("phone_verification_codes")
      .update({ verified: true })
      .eq("id", record.id);

    // 3. Update profile table to verify user's phone number
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update({
        phone,
        phone_verified: true,
      })
      .eq("id", userId);

    if (profileError) {
      return { success: false, message: "OTP verified but profile update failed: " + profileError.message };
    }

    return { success: true, message: "Phone number successfully verified." };
  } catch (err: any) {
    return { success: false, message: err.message || "An unexpected error occurred during verification." };
  }
}
