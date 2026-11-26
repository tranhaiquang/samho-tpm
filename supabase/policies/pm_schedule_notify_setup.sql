-- Daily PM "tomorrow + overdue" notification to the Zalo Bot group.
-- Prereq: pg_cron + pg_net extensions enabled.
-- Secrets set via CLI: ZALO_PM_NOTIFY_BOT_TOKEN, ZALO_PM_NOTIFY_GROUP_CHAT_ID, CRON_SECRET.

do $$
begin
  if exists (select 1 from cron.job where jobname = 'pm-schedule-notify') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'pm-schedule-notify';
  end if;
end $$;

-- cron is UTC: 01:00 UTC = 08:00 ICT (UTC+7), every day.
select cron.schedule(
  'pm-schedule-notify',
  '0 1 * * *',
  $$
  select net.http_post(
    url := 'https://tdbuvnzwrakywtvnnewl.supabase.co/functions/v1/pm-schedule-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Verify: select jobname, schedule from cron.job;
