// tmp/inspect_all.js
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySchema() {
  console.log("Starting NanoPlay Schema Integrity Audit...");
  let failed = false;

  const targets = [
    {
      table: "profiles",
      columns: [
        "id", "full_name", "username", "phone", "role", "status", "phone_verified", 
        "normalized_phone", "identity_status", "identity_legal_name", "identity_dob", 
        "identity_type", "identity_number", "identity_document_url", "identity_selfie_url", 
        "bank_name", "bank_account_number", "bank_account_name", "bank_account_flagged", 
        "bank_account_flagged_reason", "last_device_fingerprint", "last_ip_address", 
        "risk_score", "admin_notes"
      ]
    },
    {
      table: "phone_verification_codes",
      columns: ["id", "phone", "code", "expires_at", "attempts", "verified", "created_at"]
    },
    {
      table: "security_logs",
      columns: ["id", "user_id", "event_type", "ip_address", "user_agent", "timezone", "device_fingerprint", "device_metadata", "created_at"]
    },
    {
      table: "wallet_transactions",
      columns: ["id", "wallet_id", "amount", "type", "reference", "status", "created_at"]
    },
    {
      table: "challenge_matches",
      columns: ["id", "round_id", "home_team", "away_team", "kickoff_time", "home_score", "away_score", "status", "matchday", "created_at"]
    }
  ];

  for (const target of targets) {
    console.log(`Auditing table: ${target.table}...`);
    
    // Check if table and columns exist by selecting them
    const selectQuery = target.columns.join(",");
    const { error } = await supabase
      .from(target.table)
      .select(selectQuery)
      .limit(0);

    if (error) {
      console.error(`❌ Schema violation on table [${target.table}]:`, error.message);
      failed = true;
    } else {
      console.log(`   ✓ Table [${target.table}] schema integrity verified (all columns present).`);
    }
  }

  if (failed) {
    console.error("\n❌ NanoPlay Schema Audit FAILED.");
    process.exit(1);
  } else {
    console.log("\n✓ NanoPlay Schema Audit PASSED successfully. All database tables and launch columns exist.");
    process.exit(0);
  }
}

verifySchema();
