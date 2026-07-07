// src/lib/utils/redirect.ts

/**
 * Validates and sanitizes internal redirection paths to prevent Open Redirect vulnerabilities.
 * Allowed: Paths starting with a single '/' (e.g., /dashboard, /settings?tab=security)
 * Rejected: Protocol URLs, scheme bypasses, relative URL indicators (//), backslash combinations (/\), and javascript: URIs.
 */
export function safeInternalPath(value: string | null, fallback = "/dashboard"): string {
  if (!value) return fallback;

  // Normalize percent-encoded sequences
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch (e) {
    // Fallback to raw value if decoding fails
  }

  // Trim whitespace
  decoded = decoded.trim();

  // Explicitly block javascript: URIs
  if (/^\s*javascript:/i.test(decoded)) {
    return fallback;
  }

  // Verify it starts with a single forward slash and does not have leading double slashes or backslashes
  const isSafe = decoded.startsWith('/') &&
                 !decoded.startsWith('//') &&
                 !decoded.startsWith('/\\') &&
                 !decoded.startsWith('/ ');

  return isSafe ? value : fallback;
}
