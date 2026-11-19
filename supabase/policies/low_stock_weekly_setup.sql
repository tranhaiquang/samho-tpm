-- Low-stock weekly Zalo broadcast — setup (run in the Supabase SQL Editor)
-- Prereqs: extensions pg_cron and pg_net (Database → Extensions).
-- 1) Token table: stores the rotated Zalo OA refresh token between runs.
create table if not exists public.zalo_oa_tokens (
  id int primary key default 1 check (id = 1),
  refresh_token text not null,
  updated_at timestamptz not null default now()
);

-- No RLS policies on purpose: only the service role (Edge Function) touches this table; anon/authenticated get nothing.
alter table public.zalo_oa_tokens enable row level security;
revoke all on public.zalo_oa_tokens from anon, authenticated;

-- 2) pg_cron job: weekly, Monday 08:00 ICT (= 01:00 UTC).
--    Replace <CRON_SECRET> with the same value you set as the CRON_SECRET secret (step 3).
--    Idempotent: unschedules the old job first if re-running.
select cron.unschedule('low-stock-weekly');
select cron.schedule(
  'low-stock-weekly',
  '0 1 * * 1',
  $$
  select net.http_post(
    url := 'https://tdbuvnzwrakywtvnnewl.supabase.co/functions/v1/low-stock-weekly',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 3) Edge Function secrets (run in your terminal, NOT in SQL):
--    supabase secrets set CRON_SECRET=<random-long-string>
--    supabase secrets set ZALO_APP_ID=<app id>
--    supabase secrets set ZALO_APP_SECRET=<app secret>
--    supabase secrets set ZALO_OA_REFRESH_TOKEN=<oa refresh token>
--    Optional overrides if your console shows different endpoints:
--    supabase secrets set ZALO_TOKEN_URL=...  ZALO_BROADCAST_URL=...
--
-- 4) Deploy (CLI, linked to the project):
--    supabase functions deploy low-stock-weekly --no-verify-jwt
--
-- 5) Test once (replace <CRON_SECRET>):
--    curl -X POST https://tdbuvnzwrakywtvnnewl.supabase.co/functions/v1/low-stock-weekly -H "X-Cron-Secret: <CRON_SECRET>"
--
-- 6) Verify cron: select * from cron.job;  and  select * from cron.job_run_details order by start_time desc limit 5;
