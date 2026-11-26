// Daily PM notification → Zalo Bot group.
// Lists PM schedules due TOMORROW for a fixed machine-code list, plus
// overdue pending records ("missed") for the same machines. UTC+7 (Vietnam).
// Auth: pg_cron sends X-Cron-Secret (deployed --no-verify-jwt).

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const BOT_TOKEN = Deno.env.get("ZALO_PM_NOTIFY_BOT_TOKEN");
const GROUP_CHAT_ID = Deno.env.get("ZALO_PM_NOTIFY_GROUP_CHAT_ID");
const BOT_API = Deno.env.get("ZALO_BOT_API") ?? "https://bot-api.zaloplatforms.com/bot";
const MAX_TEXT = 2000;

const CODES = [
  "MC15-02309", "MC15-04063", "MC15-01061", "MC15-03571", "MC15-01058", "MC15-02632",
  "MC15-05837", "AM24-71523", "AM24-71524", "MC15-01060", "MC15-03752", "MC15-01056",
  "MC15-01062", "MC15-01057", "MC15-03750", "MC15-05847", "MC15-05944", "MC15-06094",
  "AM17-30349", "MC15-05974", "MC15-06020", "MC15-06089", "MC15-06091", "MC15-06188",
  "MC15-06093", "MC15-05946", "MC15-05945", "MC15-05972", "MC15-05973", "MC15-06123",
  "MC15-06122", "MC15-04844", "MC15-04990", "MC15-05225",
];

const db = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "User-Agent": "pm-schedule-notify/1.0",
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

const dateInICT = (offsetDays: number) =>
  new Date(Date.now() + 7 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);

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

const line = (r: any, withDue: boolean) =>
  `- ${r.item_code} | ${r.name_en || r.item_code} | ${r.plant || ""}${withDue ? ` | hạn ${r.due_date}` : ""} | PIC: ${normPic(r.pic) || "—"}`;

Deno.serve(async (req) => {
  if (!CRON_SECRET || !(await safeEqual(req.headers.get("X-Cron-Secret") ?? "", CRON_SECRET))) {
    return new Response("unauthorized", { status: 401 });
  }
  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ZALO_PM_NOTIFY_BOT_TOKEN", "ZALO_PM_NOTIFY_GROUP_CHAT_ID"]
    .filter((k) => !Deno.env.get(k));
  if (missing.length) {
    return new Response(JSON.stringify({ ok: false, error: `Missing secrets: ${missing.join(", ")}` }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const tomorrow = dateInICT(1);
    const today = dateInICT(0);
    const codes = CODES.map((c) => `"${c}"`).join(",");
    const res = await db(
      `pm_records?select=item_code,name_en,plant,due_date,status,pic,deleted&item_code=in.(${codes})&due_date=lte.${tomorrow}`
    );
    if (!res.ok) throw new Error(`pm_records read failed: HTTP ${res.status} ${await res.text()}`);
    const rows = (await res.json()).filter((r: any) => r.deleted !== true);

    const upcoming = rows.filter((r: any) => r.due_date === tomorrow);
    const missed = rows.filter((r: any) => r.due_date < today && r.status === "pending")
      .sort((a: any, b: any) => String(a.due_date).localeCompare(String(b.due_date)));

    // Only notify when tomorrow actually has PM records; silent otherwise.
    if (upcoming.length === 0) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "no PM records due tomorrow", missed: missed.length }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let text = `📅 PM ngày mai (${tomorrow}) (${upcoming.length})\n`;
    text += upcoming.map((r: any) => line(r, false)).join("\n");
    text += `\n\n⚠️ PM quá hạn chưa làm (${missed.length})\n`;
    text += missed.length
      ? missed.map((r: any) => line(r, true)).join("\n")
      : "  Không có bản ghi quá hạn.";
    const body = text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT - 3)}...` : text;

    const zres = await fetch(`${BOT_API}${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text: body }),
    });
    const zbody = await zres.text();
    if (!zres.ok) throw new Error(`Zalo Bot sendMessage failed: HTTP ${zres.status} ${zbody}`);
    return new Response(JSON.stringify({ ok: true, tomorrow, missed: missed.length, upcoming: upcoming.length, zalo: zbody }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
