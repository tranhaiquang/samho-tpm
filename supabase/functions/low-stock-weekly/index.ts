// Weekly PLANT D low-stock report → Zalo OA broadcast.
// Triggered by pg_cron (see supabase/policies/low_stock_weekly_setup.sql).
// Auth: pg_cron sends header X-Cron-Secret matching env CRON_SECRET (function is deployed --no-verify-jwt).

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const ZALO_APP_ID = Deno.env.get("ZALO_APP_ID")!;
const ZALO_APP_SECRET = Deno.env.get("ZALO_APP_SECRET")!;
const ZALO_OA_REFRESH_TOKEN = Deno.env.get("ZALO_OA_REFRESH_TOKEN") ?? "";
const ZALO_BROADCAST_URL = Deno.env.get("ZALO_BROADCAST_URL")
  ?? "https://openapi.zalo.me/v2.0/oa/message/broadcast"; // TODO: verify against your Zalo Developer console (paste the curl example to me and I'll align it)
// TODO: verify the token-refresh endpoint + body in your console; this matches the documented v4 OA flow.
const ZALO_TOKEN_URL = Deno.env.get("ZALO_TOKEN_URL")
  ?? "https://oauth.zaloapp.com/v4/oa/access_token";

const normPlant = (v: unknown) => String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const db = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "User-Agent": "low-stock-weekly/1.0",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

async function getRefreshToken(): Promise<string> {
  const res = await db("zalo_oa_tokens?id=eq.1&select=refresh_token");
  if (res.ok) {
    const rows = await res.json();
    if (rows?.[0]?.refresh_token) return rows[0].refresh_token;
  }
  return ZALO_OA_REFRESH_TOKEN; // first run: seed from env
}

async function saveRefreshToken(refreshToken: string) {
  const res = await db("zalo_oa_tokens", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ id: 1, refresh_token: refreshToken, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`zalo_oa_tokens refresh-token save failed: HTTP ${res.status} ${await res.text()}`);
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(ZALO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      app_id: ZALO_APP_ID,
      secret_key: ZALO_APP_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok || !data?.access_token) throw new Error(`Zalo token refresh failed: ${JSON.stringify(data)}`);
  if (data.refresh_token && data.refresh_token !== refreshToken) await saveRefreshToken(data.refresh_token);
  return data.access_token as string;
}

async function lowStockPlantD() {
  const res = await db("spare_parts?select=item_code,name_vietnamese,location,safety_stock,on_hand,plant");
  if (!res.ok) throw new Error(`spare_parts read failed: HTTP ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return (rows ?? []).filter((r: any) => normPlant(r.plant) === "plant d")
    .filter((r: any) => Number(r.on_hand) < Number(r.safety_stock));
}

Deno.serve(async (req) => {
  if (!CRON_SECRET || req.headers.get("X-Cron-Secret") !== CRON_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }
  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ZALO_APP_ID", "ZALO_APP_SECRET"]
    .filter((k) => !Deno.env.get(k));
  if (missing.length) {
    return new Response(JSON.stringify({ ok: false, error: `Missing secrets: ${missing.join(", ")}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const items = await lowStockPlantD();
    const text = items.length === 0
      ? "✅ Low stock PLANT D: tất cả phụ tùng đều trên mức tồn kho an toàn."
      : `⚠️ Low stock PLANT D (${items.length} items)\n` +
        items.map((i: any) => `- ${i.item_code} | ${i.name_vietnamese} | còn ${i.on_hand}/${i.safety_stock} | ${i.location}`).join("\n");

    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new Error("No Zalo OA refresh token (env ZALO_OA_REFRESH_TOKEN or zalo_oa_tokens row 1)");
    const accessToken = await refreshAccessToken(refreshToken);

    // TODO: verify endpoint + payload shape against your Zalo OA console (message type "broadcast").
    const zres = await fetch(ZALO_BROADCAST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: accessToken,
      },
      body: JSON.stringify({ message: { text } }),
    });
    const zbody = await zres.text();
    if (!zres.ok) throw new Error(`Zalo broadcast failed: HTTP ${zres.status} ${zbody}`);

    return new Response(JSON.stringify({ ok: true, sent: items.length, zalo: zbody }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
