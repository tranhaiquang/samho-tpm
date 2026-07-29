const supabaseUrl = "https://tdbuvnzwrakywtvnnewl.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const fs = await import("fs");
const raw = fs.readFileSync("C:\\Users\\LEAN15\\AppData\\Local\\Temp\\opencode\\users.json", "utf8");
const users = JSON.parse(raw.replace(/^\uFEFF/, ""));

async function createUser(card, name) {
  const email = `${card}@email.com`;
  const password = card;

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name },
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return { ok: true, email, userId: data.id, action: "created" };
  }

  if (res.status === 422) {
    // User exists — update password and metadata
    const body = await res.json();
    const msg = body.msg || "";
    const match = msg.match(/User already registered \((\w+)\)/);
    if (!match) {
      // Try to find user by email
      const search = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
        { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
      );
      if (search.ok) {
        const list = await search.json();
        const found = list.users?.[0];
        if (found) {
          const updateRes = await fetch(
            `${supabaseUrl}/auth/v1/admin/users/${found.id}`,
            {
              method: "PUT",
              headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                password,
                email_confirm: true,
                user_metadata: { display_name: name },
              }),
            }
          );
          if (updateRes.ok) {
            return { ok: true, email, userId: found.id, action: "updated" };
          }
          return { ok: false, email, error: `PUT failed: ${updateRes.status} ${await updateRes.text()}` };
        }
      }
      return { ok: false, email, error: `Search failed: ${search.status} ${await search.text()}` };
    }
    const uid = match[1];
    const updateRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${uid}`,
      {
        method: "PUT",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          email_confirm: true,
          user_metadata: { display_name: name },
        }),
      }
    );
    if (updateRes.ok) {
      return { ok: true, email, userId: uid, action: "updated" };
    }
    return { ok: false, email, error: `PUT failed: ${updateRes.status} ${await updateRes.text()}` };
  }

  return { ok: false, email, error: `POST failed: ${res.status} ${await res.text()}` };
}

let created = 0, updated = 0, failed = 0;

for (const u of users) {
  const card = u.card.trim();
  const name = u.name.trim();
  if (!/^\d+$/.test(card)) continue;

  const result = await createUser(card, name);
  if (result.ok) {
    if (result.action === "created") created++;
    else updated++;
    console.log(`[OK] ${result.action}  ${result.email}`);
  } else {
    failed++;
    console.log(`[FAIL] ${card}: ${result.error}`);
  }
}

console.log(`\nDone. Created: ${created}, Updated: ${updated}, Failed: ${failed}`);
