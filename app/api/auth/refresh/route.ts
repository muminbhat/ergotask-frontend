import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get('refresh_token')?.value;
  if (!refresh) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }
  const res = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const resp = NextResponse.json({ ok: true });
  resp.cookies.set('access_token', data.access, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' });
  return resp;
}


