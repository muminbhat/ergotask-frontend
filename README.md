ErgoTask Frontend (Next.js + Tailwind) - Prepared for Ergosphere.io (Evaluation Purpose Only) - By Mumin Bhat (12th August 2025)

Overview
- Modern app router (Next.js 15), server-side API routes as BFF (proxy to Django), JWT cookies with refresh.
- Pages: Dashboard, Task board, Task detail (AI suggest/apply, schedule), Contexts (list/new), Login/Signup.
  

- Can be accessed at: **https://ergotask.muminbhat.com/**
  

- Dashboard Screen
- <img width="1896" height="1079" alt="Screenshot 2025-08-12 172139" src="https://github.com/user-attachments/assets/70ddea7c-52dc-478f-93d4-f93644030105" />

- Tasks Screen
- <img width="1918" height="1079" alt="Screenshot 2025-08-12 172154" src="https://github.com/user-attachments/assets/027dd01c-769f-49b2-b19e-597d08842385" />

- Context Screen
- <img width="1919" height="1074" alt="Screenshot 2025-08-12 172208" src="https://github.com/user-attachments/assets/b527c8d9-56b5-4e34-98c4-bb4e0316807d" />

- Task Detail
- <img width="1919" height="1079" alt="Screenshot 2025-08-12 172230" src="https://github.com/user-attachments/assets/54672534-9e21-42e2-bd6b-5f2a0cbb9cfc" />


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


