# Real Estate CRM

Arabic/RTL React + Vite CRM for real-estate agents, backed by Supabase auth and database tables.

## Run locally

```bash
npm install
npm run dev -- --host
```

Required environment variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TRAFFIC_APPROVAL_CODES=123456
```

Never put the Supabase `service_role` key in frontend/Vite env variables.

## Database setup

Apply the Supabase migration:

```bash
supabase db push
```

Or paste this file into the Supabase SQL editor and run it:

```text
supabase/migrations/20260524165300_create_crm_schema.sql
```

The migration creates:

- `access_requests`
- `leads`
- `calls`
- `call_analysis`
- `reminders`
- `bot_presets`
- `user_bots`

It also enables row-level security. Agents can only manage their own leads, calls, analyses, reminders, and bots. Anonymous users can only submit access requests.

## Build

```bash
npm run build
```