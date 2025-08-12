import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;
  const res = await fetch(`${API_BASE_URL}/api/v1/tasks/${id}/ai-suggestions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


