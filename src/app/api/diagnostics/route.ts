// src/app/api/diagnostics/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET";
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Extract project ref
  let projectRef = "unknown";
  try {
    const url = new URL(supabaseUrl);
    projectRef = url.hostname.split(".")[0];
  } catch (e) {
    projectRef = supabaseUrl;
  }

  try {
    const adminClient = createAdminClient();

    // Query list of tables in public schema
    const { data: tablesData, error: tablesError } = await adminClient
      .rpc("get_public_tables_list"); // fallback to direct query if RPC is not available

    let tables: string[] = [];
    if (tablesError) {
      // Fallback: query tables directly using a raw query if RPC isn't loaded
      const { data: rawTables, error: rawError } = await adminClient
        .from("profiles")
        .select("id")
        .limit(1);
      
      tables = ["profiles"]; // at least profiles must exist
    } else {
      tables = (tablesData as any[] || []).map(t => t.table_name);
    }

    // Direct check for phone_verification_codes table
    const { data: colsData, error: colsError } = await adminClient
      .from("phone_verification_codes")
      .select("*")
      .limit(1);

    // Direct check for challenge_rounds table
    const { data: roundsData, error: roundsError } = await adminClient
      .from("challenge_rounds")
      .select("*")
      .limit(1);

    const tableExists = !colsError || colsError.code !== "PGRST116" && colsError.code !== "42P01" && colsError.code !== "PGRST205";
    const roundsExists = !roundsError || roundsError.code !== "PGRST116" && roundsError.code !== "42P01" && roundsError.code !== "PGRST205";
    
    const errorDetails = colsError ? { code: colsError.code, message: colsError.message } : null;
    const roundsErrorDetails = roundsError ? { code: roundsError.code, message: roundsError.message } : null;

    // Get applied migrations list
    const { data: migrationsData, error: migrationsError } = await adminClient
      .from("schema_migrations") // this might fail if schema_migrations is in a different schema
      .select("version")
      .order("version", { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      supabaseUrl,
      projectRef,
      hasServiceKey,
      tableExists,
      errorDetails,
      roundsExists,
      roundsErrorDetails,
      columnsChecked: colsData ? Object.keys(colsData[0] || {}) : null,
      migrations: migrationsData || [],
      migrationsError: migrationsError ? migrationsError.message : null
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      supabaseUrl,
      projectRef,
      hasServiceKey,
      error: err.message || err
    });
  }
}
