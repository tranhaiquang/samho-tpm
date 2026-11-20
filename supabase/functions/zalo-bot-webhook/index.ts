// Temporary diagnostic webhook: logs Zalo Bot events so we can see whether
// group messages (with chat.id) are delivered. No messages are sent from here.

Deno.serve(async (req) => {
  if (req.method === "POST") {
    try {
      const body = await req.text();
      console.log("ZALO_BOT_EVENT", body);
    } catch (e) {
      console.error("webhook read failed", e);
    }
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
