// Server-only helpers for the ops database. The key is the public one the enquiry route already uses.
export const OPS_URL = process.env.OPS_SUPABASE_URL ?? "https://qqqdjtjqizawgkzznxvm.supabase.co";
export const OPS_KEY = process.env.OPS_SUPABASE_KEY ?? "sb_publishable_f0kovNXdeLq1qZziijFi8g_YemeRMi5";

// ASSUMED token shape: 16 to 64 URL-safe characters. Anything else is treated as no token and never sent to the database.
export const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;
export const validToken = (t: unknown): t is string => typeof t === "string" && TOKEN_RE.test(t);

export async function opsRpc(fn: string, args: Record<string, unknown>, ms: number): Promise<{ ok: boolean; data: unknown }> {
  try {
    const res = await fetch(`${OPS_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: OPS_KEY, Authorization: `Bearer ${OPS_KEY}`, "content-type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
      signal: AbortSignal.timeout(ms),
    });
    return { ok: res.ok, data: res.ok ? await res.json().catch(() => null) : null };
  } catch {
    return { ok: false, data: null };
  }
}

// Who a landing token belongs to. Any problem (bad token, slow, error, odd shape) gives null, so the page just renders normally.
export async function landingFor(token: unknown): Promise<{ company: string; website: string } | null> {
  if (!validToken(token)) return null;
  const { data } = await opsRpc("outreach_landing", { p_token: token }, 1500);
  const d = data as { company_name?: unknown; website?: unknown } | null;
  const company = typeof d?.company_name === "string" ? d.company_name.trim().slice(0, 80) : "";
  if (!company) return null;
  return { company, website: typeof d?.website === "string" ? d.website.trim().slice(0, 300) : "" };
}
