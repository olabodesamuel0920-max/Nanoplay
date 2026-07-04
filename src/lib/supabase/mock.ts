// src/lib/supabase/mock.ts

export const mockUserPlayer = {
  id: "mock-player-id",
  email: "player@nanoplay.com",
  user_metadata: {
    full_name: "Olabode Samuel",
    username: "olabodesamuel"
  }
};

export const mockUserAdmin = {
  id: "mock-admin-id",
  email: "olabodesamuel0920@gmail.com",
  user_metadata: {
    full_name: "Olabode Samuel (Admin)",
    username: "olabodesamuel_admin"
  }
};

export const mockProfilePlayer = {
  id: "mock-player-id",
  full_name: "Olabode Samuel",
  username: "olabodesamuel",
  phone: "08012345678",
  role: "user",
  status: "active",
  phone_verified: true,
  normalized_phone: "2348012345678",
  identity_status: "verified",
  identity_legal_name: "OLABODE SAMUEL",
  identity_dob: "1995-01-01",
  identity_type: "NIN",
  identity_number: "12345678901",
  identity_document_url: "https://example.com/nin.jpg",
  identity_selfie_url: "https://example.com/selfie.jpg",
  bank_name: "Access Bank",
  bank_account_number: "1234567890",
  bank_account_name: "OLABODE SAMUEL",
  bank_account_flagged: false,
  bank_account_flagged_reason: null,
  last_device_fingerprint: "device-123",
  last_ip_address: "127.0.0.1",
  risk_score: 0.05,
  admin_notes: null
};

export const mockProfileAdmin = {
  id: "mock-admin-id",
  full_name: "Olabode Samuel (Admin)",
  username: "olabodesamuel_admin",
  phone: "08087654321",
  role: "admin",
  status: "active",
  phone_verified: true,
  normalized_phone: "2348087654321",
  identity_status: "verified",
  identity_legal_name: "OLABODE SAMUEL ADMIN",
  identity_dob: "1990-01-01",
  identity_type: "NIN",
  identity_number: "10987654321",
  bank_name: "Access Bank",
  bank_account_number: "0987654321",
  bank_account_name: "OLABODE SAMUEL ADMIN",
  bank_account_flagged: false,
  risk_score: 0.01
};

export const mockWalletPlayer = {
  id: "wallet-player-id",
  user_id: "mock-player-id",
  balance_ngn: 152000,
  ledger_balance_ngn: 152000,
  bank_name: "Access Bank",
  bank_account_number: "1234567890",
  bank_account_name: "OLABODE SAMUEL"
};

export const mockWalletAdmin = {
  id: "wallet-admin-id",
  user_id: "mock-admin-id",
  balance_ngn: 5000000,
  ledger_balance_ngn: 5000000,
  bank_name: "Access Bank",
  bank_account_number: "0987654321",
  bank_account_name: "OLABODE SAMUEL ADMIN"
};

export const mockTiers = [
  { id: "tier-1", name: "Starter", price_ngn: 5000, perks: { reward: "NGN 15,000 potential reward", predictions_per_round: 3, referral_bonus: 1000 }, is_active: true },
  { id: "tier-2", name: "Standard", price_ngn: 10000, perks: { reward: "NGN 30,000 potential reward", predictions_per_round: 3, referral_bonus: 1000, priority: true }, is_active: true },
  { id: "tier-3", name: "Premium", price_ngn: 20000, perks: { reward: "NGN 60,000 potential reward", predictions_per_round: 3, referral_bonus: 1000, priority: true, elite_badge: true }, is_active: true }
];

export const mockActiveRound = {
  id: "round-active",
  round_number: 14,
  status: "active",
  reward_pool_ngn: 15000000,
  entry_fee_ngn: 5000,
  prediction_limit: 3,
  start_date: "2026-07-01T00:00:00Z",
  end_date: "2026-07-15T23:59:59Z",
  lock_time: "2026-07-15T12:00:00Z"
};

export const mockMatches = [
  { id: "match-1", round_id: "round-active", home_team: "Chelsea", away_team: "Arsenal", kickoff_time: "2026-07-15T12:00:00Z", home_score: null, away_score: null, status: "scheduled", matchday: 1 },
  { id: "match-2", round_id: "round-active", home_team: "Manchester United", away_team: "Liverpool", kickoff_time: "2026-07-15T15:00:00Z", home_score: null, away_score: null, status: "scheduled", matchday: 1 },
  { id: "match-3", round_id: "round-active", home_team: "Real Madrid", away_team: "Barcelona", kickoff_time: "2026-07-15T20:00:00Z", home_score: null, away_score: null, status: "scheduled", matchday: 1 }
];

export const mockEntryPlayer = {
  id: "entry-player",
  user_id: "mock-player-id",
  round_id: "round-active",
  tier_id: "tier-2",
  status: "submitted",
  created_at: "2026-07-04T12:00:00Z"
};

export const mockPredictionsPlayer = [
  { id: "pred-1", entry_id: "entry-player", match_id: "match-1", prediction: "1" },
  { id: "pred-2", entry_id: "entry-player", match_id: "match-2", prediction: "2" },
  { id: "pred-3", entry_id: "entry-player", match_id: "match-3", prediction: "X" }
];

export const mockTransactions = [
  { id: "tx-1", wallet_id: "wallet-player-id", amount: 50000, type: "deposit", reference: "pay_ref_1", status: "success", created_at: "2026-07-01T10:00:00Z" },
  { id: "tx-2", wallet_id: "wallet-player-id", amount: -10000, type: "entry", reference: "arena_purchase_1", status: "success", created_at: "2026-07-02T11:00:00Z" }
];

export const mockSecurityLogs = [
  { id: "log-1", user_id: "mock-player-id", event_type: "auth.login", ip_address: "192.168.1.1", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0", timezone: "Africa/Lagos", device_fingerprint: "df1", device_metadata: {}, created_at: "2026-07-04T12:00:00Z" },
  { id: "log-2", user_id: "mock-player-id", event_type: "wallet.withdraw", ip_address: "192.168.1.1", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0", timezone: "Africa/Lagos", device_fingerprint: "df1", device_metadata: {}, created_at: "2026-07-04T13:00:00Z" }
];

export const mockPlatformSettings = [
  { key: "wallet_funding_enabled", value: "false" },
  { key: "paystack_mode", value: "\"disabled\"" }
];

// Helper to get cookie on server or client
export function getSessionFromCookies(cookieString: string | null): "player" | "admin" | null {
  if (!cookieString) return null;
  const match = cookieString.match(/(?:^|;)\s*nanoplay-session\s*=\s*([^;]+)/);
  if (match && (match[1] === "player" || match[1] === "admin")) {
    return match[1] as any;
  }
  return null;
}

export function createMockSupabaseClient(sessionType: "player" | "admin" | null) {
  const isPlayer = sessionType === "player";
  const user = isPlayer ? mockUserPlayer : (sessionType === "admin" ? mockUserAdmin : null);
  const profile = isPlayer ? mockProfilePlayer : (sessionType === "admin" ? mockProfileAdmin : null);
  const wallet = isPlayer ? mockWalletPlayer : (sessionType === "admin" ? mockWalletAdmin : null);
  const entry = isPlayer ? mockEntryPlayer : null; // Admin unenrolled, Player enrolled
  const predictions = isPlayer ? mockPredictionsPlayer : [];

  const mockProfilesList = [
    mockProfilePlayer,
    {
      id: "mock-flagged-id",
      full_name: "Flagged User",
      username: "flagged_user",
      phone: "08099999999",
      role: "user",
      status: "flagged",
      phone_verified: true,
      normalized_phone: "2348099999999",
      identity_status: "unverified",
      risk_score: 0.85
    },
    {
      id: "mock-under-review-id",
      full_name: "Review User",
      username: "review_user",
      phone: "08088888888",
      role: "user",
      status: "under_review",
      phone_verified: true,
      normalized_phone: "2348088888888",
      identity_status: "pending",
      risk_score: 0.65
    }
  ];

  const mockWinnersList = [
    { id: "win-1", entry_id: "entry-player", prize_pool_share_ngn: 1500000, status: "pending", profile: mockProfilePlayer }
  ];

  const queryChain = (data: any, countVal: number | null = null) => {
    const chain: any = {
      select: (fields?: string, opts?: any) => {
        if (opts && opts.count) {
          const actualCount = countVal !== null ? countVal : (Array.isArray(data) ? data.length : (data ? 1 : 0));
          return queryChain(data, actualCount);
        }
        return chain;
      },
      eq: () => chain,
      or: () => chain,
      in: () => chain,
      gte: () => chain,
      lte: () => chain,
      neq: () => chain,
      like: () => chain,
      ilike: () => chain,
      order: () => chain,
      limit: () => chain,
      single: async () => ({ data: Array.isArray(data) ? data[0] : data, count: countVal, error: null }),
      maybeSingle: async () => ({ data: Array.isArray(data) ? data[0] : data, count: countVal, error: null }),
      then: (onfulfilled: any) => Promise.resolve({ data, count: countVal, error: null }).then(onfulfilled)
    };
    return chain;
  };

  return {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      getSession: async () => ({ data: { session: user ? { user } : null }, error: null }),
      signInWithPassword: async ({ email }: any) => {
        const type = email.includes("admin") ? "admin" : "player";
        if (typeof document !== "undefined") {
          document.cookie = `nanoplay-session=${type}; path=/; max-age=86400`;
        }
        return { data: { user: type === "admin" ? mockUserAdmin : mockUserPlayer }, error: null };
      },
      signOut: async () => {
        if (typeof document !== "undefined") {
          document.cookie = "nanoplay-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        return { error: null };
      },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table: string) => {
      if (table === "profiles") {
        return queryChain(sessionType === "admin" ? mockProfilesList : profile);
      }
      if (table === "wallets") {
        return queryChain(wallet);
      }
      if (table === "account_tiers") {
        return queryChain(mockTiers);
      }
      if (table === "challenge_rounds") {
        return queryChain(mockActiveRound);
      }
      if (table === "challenge_matches") {
        return queryChain(mockMatches);
      }
      if (table === "challenge_entries") {
        return queryChain(entry);
      }
      if (table === "predictions") {
        return queryChain(predictions);
      }
      if (table === "referrals") {
        return queryChain([]);
      }
      if (table === "security_logs") {
        return queryChain(mockSecurityLogs);
      }
      if (table === "wallet_transactions") {
        return queryChain(mockTransactions);
      }
      if (table === "platform_settings") {
        return queryChain(mockPlatformSettings);
      }
      if (table === "winners") {
        return queryChain(mockWinnersList);
      }
      return queryChain(null);
    },
    rpc: (func: string) => {
      if (func === "purchase_tier_with_wallet_atomic") {
        return { error: null };
      }
      return { error: null };
    }
  } as any;
}

