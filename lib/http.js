import { cookies } from 'next/headers';
import { API_BASE_URL } from './config';

export async function apiFetch(path, { method = 'GET', body, headers = {}, nextOptions = {} } = {}) {
  const cookieStore = cookies();
  const access = cookieStore.get('access_token')?.value;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    ...nextOptions,
  });

  if (res.status === 401) {
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data?.error?.detail || JSON.stringify(data);
    } catch {}
    throw new Error(msg);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}


