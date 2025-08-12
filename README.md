ErgoTask Frontend (Next.js + Tailwind) - Prepared for Ergosphere.io (Evaluation Purpose Only) - By Mumin Bhat (12th August 2025)

Overview
- Modern app router (Next.js 15), server-side API routes as BFF (proxy to Django), JWT cookies with refresh.
- Pages: Dashboard, Task board, Task detail (AI suggest/apply, schedule), Contexts (list/new), Login/Signup.

Local setup
1) Node 18+ and PNPM or NPM
2) Env:
   - `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` This is where your backend will be pointing to, change if its different. 
3) Install and run:
   - `npm install`
   - `npm run dev`
   - Open http://localhost:3000

Production (Vercel)
- Set env: `NEXT_PUBLIC_API_BASE_URL=https://ergotask-production.up.railway.app` enter backend endpoint in variable

Auth UX
- Login/Signup set `access_token`/`refresh_token` HTTP-only cookies and a non-http-only `is_logged_in=1` for nav.
- Middleware:
  - Redirects authenticated users away from `/login` and `/signup` to `/`.
  - Redirects unauthenticated users visiting protected pages to `/login?next=...`.

Common actions
- Seed sample data for the logged-in user: open `/api/tasks/seed-sample-data` in the browser. (This will populate data)
- Export: `/api/tasks/export?format=json|csv` (proxy to backend). (To export the data)