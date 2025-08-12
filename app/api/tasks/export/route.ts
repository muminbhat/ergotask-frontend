import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fmt = url.searchParams.get('format') || 'json';
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const res = await fetch(`${API_BASE_URL}/api/v1/tasks/export/?format=${encodeURIComponent(fmt)}`, {
    headers: { ...(access ? { Authorization: `Bearer ${access}` } : {}) },
  });
  const buf = await res.arrayBuffer();
  const headers = new Headers();
  for (const [k, v] of res.headers) headers.set(k, v);
  return new NextResponse(buf, { status: res.status, headers });
}


