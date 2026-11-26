// Daily PM due-date reminder → Zalo Bot group.
// Lists Plant A machines with a PM record due TODAY (Vietnam time, UTC+7).
// Auth: pg_cron sends X-Cron-Secret matching CRON_SECRET (deployed --no-verify-jwt).

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const BOT_TOKEN = Deno.env.get("ZALO_PM_BOT_TOKEN");
const GROUP_CHAT_ID = Deno.env.get("ZALO_PM_GROUP_CHAT_ID");
const BOT_API = Deno.env.get("ZALO_BOT_API") ?? "https://bot-api.zaloplatforms.com/bot";
const MAX_TEXT = 2000;

const normPlant = (v: unknown) => String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const normPic = (v: unknown) => {
  if (Array.isArray(v)) return v.join(", ");
  const s = String(v ?? "").trim();
  if (!s) return "";
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed.join(", ") : s;
  } catch {
    return s;
  }
};

const todayICT = () => new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

const db = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "User-Agent": "pm-due-reminder/1.0",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

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

async function dueTodayPlantA(date: string) {
  const res = await db(`pm_records?select=item_code,name_en,plant,due_date,status,pic,deleted&due_date=eq.${date}`);
  if (!res.ok) throw new Error(`pm_records read failed: HTTP ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return (rows ?? [])
    .filter((r: any) => normPlant(r.plant) === "plant a")
    .filter((r: any) => r.deleted !== true);
}

Deno.serve(async (req) => {
  if (!CRON_SECRET || !(await safeEqual(req.headers.get("X-Cron-Secret") ?? "", CRON_SECRET))) {
    return new Response("unauthorized", { status: 401 });
  }
  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ZALO_PM_BOT_TOKEN", "ZALO_PM_GROUP_CHAT_ID"]
    .filter((k) => !Deno.env.get(k));
  if (missing.length) {
    return new Response(JSON.stringify({ ok: false, error: `Missing secrets: ${missing.join(", ")}` }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const date = todayICT();
    const items = await dueTodayPlantA(date);
    const text = items.length === 0
      ? `✅ PM hôm nay (${date}) - Plant A: không có máy nào đến hạn.`
      : `⚠️ PM hôm nay (${date}) - Plant A (${items.length} máy)\n` +
        items.map((i: any) => `- ${i.item_code} | ${i.name_en || i.item_code} | PIC: ${normPic(i.pic) || "—"} | ${i.status || "pending"}`).join("\n");
    const body = text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT - 3)}...` : text;

    const zres = await fetch(`${BOT_API}${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text: body }),
    });
    const zbody = await zres.text();
    if (!zres.ok) throw new Error(`Zalo Bot sendMessage failed: HTTP ${zres.status} ${zbody}`);
    return new Response(JSON.stringify({ ok: true, date, sent: items.length, zalo: zbody }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
