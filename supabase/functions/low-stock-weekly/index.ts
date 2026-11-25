// Weekly PLANT D low-stock report → Zalo Bot group message.
// Triggered by pg_cron (see supabase/policies/low_stock_weekly_setup.sql).
// Auth: pg_cron sends header X-Cron-Secret matching env CRON_SECRET (function is deployed --no-verify-jwt).

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const BOT_TOKEN = Deno.env.get("ZALO_BOT_TOKEN");
const GROUP_CHAT_ID = Deno.env.get("ZALO_GROUP_CHAT_ID");
const BOT_API = Deno.env.get("ZALO_BOT_API") ?? "https://bot-api.zaloplatforms.com/bot";
const MAX_TEXT = 2000; // Zalo Bot text limit

// Constant-time-ish comparison of two secrets (hash both, compare all digest bytes).
const safeEqual = async (a: string, b: string) => {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0 && a.length === b.length;
};

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

async function lowStockPlantD() {
  const res = await db("spare_parts?select=item_code,name_vietnamese,location,safety_stock,on_hand,plant");
  if (!res.ok) throw new Error(`spare_parts read failed: HTTP ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return (rows ?? []).filter((r: any) => normPlant(r.plant) === "plant d")
    .filter((r: any) => Number(r.on_hand) < Number(r.safety_stock));
}

Deno.serve(async (req) => {
  if (!CRON_SECRET || !(await safeEqual(req.headers.get("X-Cron-Secret") ?? "", CRON_SECRET))) {
    return new Response("unauthorized", { status: 401 });
  }
  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ZALO_BOT_TOKEN", "ZALO_GROUP_CHAT_ID"]
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
    const body = text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT - 3)}...` : text;

    const zres = await fetch(`${BOT_API}${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text: body }),
    });
    const zbody = await zres.text();
    if (!zres.ok) throw new Error(`Zalo Bot sendMessage failed: HTTP ${zres.status} ${zbody}`);

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
