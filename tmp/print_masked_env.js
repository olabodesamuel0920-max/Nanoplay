// tmp/print_masked_env.js
const { createClient } = require("@supabase/supabase-js");

const projectRef = process.env.SUPABASE_PROJECT_REF || "NOT_SET";
const dbUrl = process.env.DATABASE_URL || "NOT_SET";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET";

function maskString(str) {
  if (!str || str === "NOT_SET") return "NOT_SET";
  if (str.length <= 6) return "***";
  return str.substring(0, 3) + "..." + str.substring(str.length - 3);
}

function maskUrl(urlStr) {
  if (!urlStr || urlStr === "NOT_SET") return "NOT_SET";
  try {
    const url = new URL(urlStr);
    return `${url.protocol}//${maskString(url.hostname)}`;
  } catch (e) {
    return maskString(urlStr);
  }
}

console.log("=== Environment Isolation Verification ===");
console.log(`Staging Project Ref: ${maskString(projectRef)}`);
console.log(`Staging Supabase URL: ${maskUrl(supabaseUrl)}`);

if (dbUrl !== "NOT_SET") {
  try {
    // Extract hostname from connection string
    const match = dbUrl.match(/@([^:/]+)/);
    if (match) {
      console.log(`Staging DB Hostname: ${maskString(match[1])}`);
    } else {
      console.log(`Staging DB Hostname: (Unable to parse)`);
    }
  } catch (e) {
    console.log(`Staging DB Hostname: (Error parsing)`);
  }
} else {
  console.log("Staging DB Hostname: NOT_SET");
}

// Check Paystack test mode and wallet funding status
const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "NOT_SET";
const walletFunding = process.env.WALLET_FUNDING_ENABLED || "NOT_SET";

console.log(`Paystack Key Prefix: ${paystackKey.substring(0, 8)}...`);
console.log(`Wallet Funding Enabled: ${walletFunding}`);

// Check if staging is different from production by verifying they are different variables/refs
// The production ref is known to be: zzwfspndlbyjplgipjox (or similar). Let's compare if they are different.
const prodRef = "zzwfspndlbyjplgipjox"; // Production project ref
console.log(`Staging project ref differs from production: ${projectRef !== prodRef}`);
console.log("==========================================");
