const supabaseUrl = "https://tdbuvnzwrakywtvnnewl.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYnV2bnp3cmFreXd0dm5uZXdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk3NTMwMywiZXhwIjoyMDk4NTUxMzAzfQ.UkA8V-TpdaHB6JNJRGKylTMoEJt_kOFeIL9N3U7dGmw";

const EXCLUDED_USER_ID = "1aadbeb2-836d-4508-a9e6-e0f8b418568a";
const EMAIL_DOMAIN = "@email.com";

const fs = await import("fs");
const raw = fs.readFileSync("C:\\Users\\LEAN15\\AppData\\Local\\Temp\\opencode\\users.json", "utf8");
const excelUsers = JSON.parse(raw.replace(/^\uFEFF/, ""));
const validCards = new Set(
  excelUsers
    .map((u) => u.card.trim())
    .filter((c) => /^\d+$/.test(c))
);

async function getAllUsers() {
  const all = [];
  let page = 1;
  const perPage = 200;

  for (;;) {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    if (!res.ok) throw new Error(`List users failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    const users = data.users || [];
    all.push(...users);
    if (users.length < perPage) break;
    page++;
  }
  return all;
}

async function deleteUser(uid, email) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${uid}`, {
    method: "DELETE",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
  });
  if (res.ok) {
    console.log(`[DELETED] ${email}`);
    return true;
  }
  console.log(`[FAIL] ${email}: ${res.status} ${await res.text()}`);
  return false;
}

console.log("Fetching all users from Supabase Auth...");
const allUsers = await getAllUsers();
console.log(`Total users in Auth: ${allUsers.length}`);

let deleted = 0, skipped = 0;

for (const u of allUsers) {
  const email = u.email || "";

  // Always keep Nguyễn Minh Quang
  if (u.id === EXCLUDED_USER_ID) {
    console.log(`[SKIP] ${email} (Nguyễn Minh Quang - excluded)`);
    skipped++;
    continue;
  }

  // Only process @email.com accounts
  if (!email.endsWith(EMAIL_DOMAIN)) {
    console.log(`[SKIP] ${email} (non-standard domain)`);
    skipped++;
    continue;
  }

  const card = email.replace(EMAIL_DOMAIN, "");
  if (!validCards.has(card)) {
    await deleteUser(u.id, email);
    deleted++;
  } else {
    skipped++;
  }
}

console.log(`\nDone. Deleted: ${deleted}, Skipt/Kept: ${skipped}`);
