import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const cookieStore = cookies();
  const isProd = process.env.NODE_ENV === 'production';
  cookieStore.set('access_token', data.access, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' });
  cookieStore.set('refresh_token', data.refresh, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' });

  return NextResponse.json({ ok: true });
}


