# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Arabic Real Estate CRM ("نظام إدارة العقارات") — a single-page React + TypeScript app built with Vite. The backend is a remote Supabase instance (PostgreSQL + Auth + Edge Functions); there is no local backend or database.

### Dev commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (Vite on port 5173) |
| Build | `npm run build` (`tsc && vite build`) |
| Preview prod | `npm run preview` |

### Caveats

- **No test framework or lint tooling** is configured in this repo. There are no test scripts, testing libraries, or ESLint/Prettier configs.
- **Supabase is remote-only.** The `.env` file contains credentials for a hosted Supabase project (`huyidcbqginhiccpcjhj.supabase.co`). Auth and all data operations require network access to this instance.
- **Supabase may be unreachable** from sandboxed/cloud environments. The frontend loads and renders correctly regardless, but login/signup and all data operations will fail with "Failed to fetch" if the Supabase endpoint is not accessible.
- **Duplicate `.js` files** exist alongside every `.tsx`/`.ts` source file (likely from a StackBlitz export). The canonical sources are the TypeScript files; the `.js` duplicates are not used by the build.
- **RTL / Arabic UI** — the entire interface is in Arabic with right-to-left layout (`lang="ar"` on `<html>`).
