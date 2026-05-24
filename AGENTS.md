# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **Real Estate CRM** (نظام إدارة العقارات) — an Arabic/RTL React SPA built with Vite + TypeScript + Supabase. There is no local backend; all data (auth, leads, calls, reminders) is handled by the hosted Supabase instance.

### Development commands

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 5173) |
| Type check | `npx tsc --noEmit` |
| Production build | `npm run build` |

There is no ESLint config, no test framework, and no lint script in this repo. The TypeScript compiler (`tsc --noEmit`) is the primary static analysis tool.

### Database

The Supabase schema lives in `supabase/migrations/20260524165300_create_crm_schema.sql`.
Apply it with `supabase db push` or by running the SQL in Supabase SQL editor.

### Important notes

- **External dependency**: The app requires network access to `https://huyidcbqginhiccpcjhj.supabase.co` for authentication and all data operations. The Supabase anon key and URL are in `.env`. If DNS cannot resolve this host (common in restricted cloud VMs), authentication will fail with "Failed to fetch" but the frontend UI still renders correctly.
- **No local backend**: There is nothing to docker-compose or run locally beyond the Vite dev server. The database is hosted in Supabase and managed by the migration file.
- **RTL layout**: The UI is entirely in Arabic with right-to-left layout. This is by design.
- **Node.js**: The project works with Node 22+. The `package-lock.json` is the lockfile (use `npm install`).
