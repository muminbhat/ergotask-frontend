import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || 'http://localhost:3000'));
}


