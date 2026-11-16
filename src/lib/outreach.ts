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

export type Evidence = { kind: "job_advert" | "website" | "filing"; quote: string; url: string; seenOn: string };
export type Known = { company: string; website: string; situation: string; evidence: Evidence[]; artefactUrl: string };

const KINDS = ["job_advert", "website", "filing"];
// Links from the database are shown to visitors, so only plain web addresses are accepted.
function webUrl(v: unknown, httpsOnly = false): string {
  if (typeof v !== "string") return "";
  try {
    const u = new URL(v.trim().slice(0, 500));
    return u.protocol === "https:" || (!httpsOnly && u.protocol === "http:") ? u.toString() : "";
  } catch {
    return "";
  }
}

// Who a landing token belongs to. Any problem (bad token, slow, error, odd shape) gives null, so the page just renders normally.
// Every key except company_name is optional: older rows carry only the name and website.
export async function landingFor(token: unknown): Promise<Known | null> {
  if (!validToken(token)) return null;
  const { data } = await opsRpc("outreach_landing", { p_token: token }, 1500);
  const d = data as Record<string, unknown> | null;
  const company = typeof d?.company_name === "string" ? d.company_name.trim().slice(0, 80) : "";
  if (!company) return null;
  const evidence: Evidence[] = (Array.isArray(d?.evidence) ? d.evidence : [])
    .map((e: unknown) => {
      const r = (e ?? {}) as Record<string, unknown>;
      const quote = typeof r.quote === "string" ? r.quote.trim().slice(0, 400) : "";
      const kind = KINDS.includes(r.kind as string) ? (r.kind as Evidence["kind"]) : null;
      const seenOn = typeof r.seen_on === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.seen_on) ? r.seen_on : "";
      return kind && quote ? { kind, quote, url: webUrl(r.url), seenOn } : null;
    })
    .filter((e): e is Evidence => e !== null)
    .slice(0, 3);
  return {
    company,
    website: typeof d?.website === "string" ? d.website.trim().slice(0, 300) : "",
    situation: typeof d?.situation === "string" ? d.situation.slice(0, 40) : "",
    evidence,
    artefactUrl: webUrl(d?.artefact_url, true),
  };
}
