import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const resp = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || 'http://localhost:3000'));
  resp.cookies.set('access_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  resp.cookies.set('refresh_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return resp;
}


