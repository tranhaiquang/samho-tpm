// Diagnostic webhook: logs Zalo Bot events so we can capture group chat.id.
// Requires the secret token Zalo sends in X-Bot-Api-Secret-Token.

const WEBHOOK_SECRET = Deno.env.get("ZALO_BOT_WEBHOOK_SECRET");

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

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" },
    });
  }
  if (!WEBHOOK_SECRET || !(await safeEqual(req.headers.get("X-Bot-Api-Secret-Token") ?? "", WEBHOOK_SECRET))) {
    return new Response("unauthorized", { status: 401 });
  }
  try {
    console.log("ZALO_BOT_EVENT", await req.text());
  } catch (e) {
    console.error("webhook read failed", e);
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
