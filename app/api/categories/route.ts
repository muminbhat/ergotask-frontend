import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function GET() {
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  let res = await fetch(`${API_BASE_URL}/api/v1/categories/`, {
    headers: { ...(access ? { Authorization: `Bearer ${access}` } : {}) },
    cache: 'no-store',
  });
  if (res.status === 401) {
    const refresh = cookieStore.get('refresh_token')?.value;
    if (refresh) {
      const r = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }) });
      if (r.ok) {
        const j = await r.json();
        res = await fetch(`${API_BASE_URL}/api/v1/categories/`, { headers: { Authorization: `Bearer ${j.access}` }, cache: 'no-store' });
        const data = await res.json();
        const reply = NextResponse.json(data, { status: res.status });
        reply.cookies.set('access_token', j.access, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
        return reply;
      }
    }
  }
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


