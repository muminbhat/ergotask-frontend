import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const ctype = request.headers.get('content-type') || '';
  let res: Response;
  if (ctype.includes('multipart/form-data')) {
    const formData = await request.formData();
    res = await fetch(`${API_BASE_URL}/api/v1/tasks/import/`, {
      method: 'POST',
      headers: { ...(access ? { Authorization: `Bearer ${access}` } : {}) },
      body: formData as any,
    });
  } else {
    const body = await request.json();
    res = await fetch(`${API_BASE_URL}/api/v1/tasks/import/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) },
      body: JSON.stringify(body),
    });
  }
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


