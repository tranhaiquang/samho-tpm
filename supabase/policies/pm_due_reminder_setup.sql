-- Daily PM due-date reminder to the Zalo Bot group (Mon–Sat, 08:00 ICT).
-- Prereq: pg_cron + pg_net extensions enabled in the Supabase project.
-- Secrets already set via CLI (never in this file):
--   ZALO_PM_BOT_TOKEN, ZALO_PM_GROUP_CHAT_ID, CRON_SECRET

do $$
begin
  if exists (select 1 from cron.job where jobname = 'pm-due-reminder') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'pm-due-reminder';
  end if;
end $$;

-- cron runs in UTC: 01:00 UTC = 08:00 ICT (UTC+7). 1-6 = Mon..Sat.
select cron.schedule(
  'pm-due-reminder',
  '0 1 * * 1-6',
  $$
  select net.http_post(
    url := 'https://tdbuvnzwrakywtvnnewl.supabase.co/functions/v1/pm-due-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Verify: select jobname, schedule from cron.job;
