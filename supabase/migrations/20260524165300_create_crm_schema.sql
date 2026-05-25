-- Real Estate CRM database schema.
-- Run this in Supabase SQL editor or with `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  phone text not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  location text,
  property_type text,
  budget_range text,
  status text not null default 'New',
  language text not null default 'ar',
  created_at timestamptz not null default now()
);

create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  agent_id uuid not null references auth.users(id) on delete cascade,
  transcript text,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  call_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.call_analysis (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  agent_id uuid not null references auth.users(id) on delete cascade,
  suggested_sentiment text,
  suggested_summary text,
  suggested_summary_ar text,
  suggested_next_action text,
  suggested_reminder_days integer check (suggested_reminder_days is null or suggested_reminder_days >= 0),
  keywords_matched text[] not null default '{}',
  confirmed_sentiment text,
  confirmed_summary text,
  confirmed_summary_ar text,
  confirmed_next_action text,
  confirmed_reminder_days integer check (confirmed_reminder_days is null or confirmed_reminder_days >= 0),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  call_analysis_id uuid references public.call_analysis(id) on delete cascade,
  agent_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  reminder_date date not null,
  reminder_type text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.bot_presets (
  id text primary key,
  name text not null,
  description text not null,
  system_prompt text not null,
  temperature numeric(3, 2) not null check (temperature >= 0 and temperature <= 2),
  max_tokens integer not null check (max_tokens > 0),
  thinking_supported boolean not null default false,
  search_supported boolean not null default false,
  plugins text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_bots (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references auth.users(id) on delete cascade,
  preset_id text not null references public.bot_presets(id) on delete restrict,
  api_key_hint text not null,
  thinking_enabled boolean not null default false,
  search_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists leads_agent_created_idx on public.leads(agent_id, created_at desc);
create index if not exists calls_agent_date_idx on public.calls(agent_id, call_date desc);
create index if not exists calls_lead_date_idx on public.calls(lead_id, call_date desc);
create index if not exists call_analysis_call_idx on public.call_analysis(call_id);
create index if not exists reminders_agent_date_idx on public.reminders(agent_id, completed, reminder_date);
create index if not exists user_bots_agent_created_idx on public.user_bots(agent_id, created_at desc);
create index if not exists access_requests_status_created_idx on public.access_requests(status, created_at desc);

alter table public.access_requests enable row level security;
alter table public.leads enable row level security;
alter table public.calls enable row level security;
alter table public.call_analysis enable row level security;
alter table public.reminders enable row level security;
alter table public.bot_presets enable row level security;
alter table public.user_bots enable row level security;

drop policy if exists "Anyone can submit access requests" on public.access_requests;
create policy "Anyone can submit access requests"
  on public.access_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Agents can manage own leads" on public.leads;
create policy "Agents can manage own leads"
  on public.leads
  for all
  to authenticated
  using (agent_id = auth.uid())
  with check (agent_id = auth.uid());

drop policy if exists "Agents can manage own calls" on public.calls;
create policy "Agents can manage own calls"
  on public.calls
  for all
  to authenticated
  using (agent_id = auth.uid())
  with check (
    agent_id = auth.uid()
    and exists (
      select 1
      from public.leads
      where leads.id = calls.lead_id
        and leads.agent_id = auth.uid()
    )
  );

drop policy if exists "Agents can manage own analyses" on public.call_analysis;
create policy "Agents can manage own analyses"
  on public.call_analysis
  for all
  to authenticated
  using (agent_id = auth.uid())
  with check (
    agent_id = auth.uid()
    and exists (
      select 1
      from public.calls
      where calls.id = call_analysis.call_id
        and calls.agent_id = auth.uid()
    )
  );

drop policy if exists "Agents can manage own reminders" on public.reminders;
create policy "Agents can manage own reminders"
  on public.reminders
  for all
  to authenticated
  using (agent_id = auth.uid())
  with check (
    agent_id = auth.uid()
    and exists (
      select 1
      from public.leads
      where leads.id = reminders.lead_id
        and leads.agent_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can read bot presets" on public.bot_presets;
create policy "Authenticated users can read bot presets"
  on public.bot_presets
  for select
  to authenticated
  using (true);

drop policy if exists "Agents can manage own bots" on public.user_bots;
create policy "Agents can manage own bots"
  on public.user_bots
  for all
  to authenticated
  using (agent_id = auth.uid())
  with check (agent_id = auth.uid());

insert into public.bot_presets (
  id,
  name,
  description,
  system_prompt,
  temperature,
  max_tokens,
  thinking_supported,
  search_supported,
  plugins
) values
  (
    'sales-qualifier',
    'مساعد تأهيل العملاء',
    'يصنف العميل العقاري ويقترح الخطوة التالية من المكالمة أو الرسائل.',
    'You are a real-estate sales qualification assistant. Score intent, summarize needs, and recommend the next follow-up action in Arabic.',
    0.35,
    1200,
    true,
    true,
    array['supabase', 'search']
  ),
  (
    'follow-up-operator',
    'منسق المتابعة',
    'ينظم المهام والتذكيرات بعد المكالمات ويربطها بسير العمل الداخلي.',
    'You are a follow-up operations bot. Convert call outcomes into concise tasks, CRM updates, and reminder actions.',
    0.25,
    900,
    false,
    true,
    array['linear', 'airtable', 'search']
  ),
  (
    'knowledge-advisor',
    'مستشار المعرفة',
    'يجيب من معرفة الشركة والبيانات المصرح بها فقط.',
    'You are a private knowledge assistant. Answer using approved company notes and CRM context. If the answer is not available, say so clearly.',
    0.20,
    1500,
    true,
    true,
    array['obsidian', 'supabase', 'search']
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  system_prompt = excluded.system_prompt,
  temperature = excluded.temperature,
  max_tokens = excluded.max_tokens,
  thinking_supported = excluded.thinking_supported,
  search_supported = excluded.search_supported,
  plugins = excluded.plugins,
  updated_at = now();
