// Client-safe version for use in client components
export function clientAbsoluteUrl(path: string): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current window location
    const p = path.startsWith('/') ? path : `/${path}`
    return `${window.location.origin}${p}`
  } else {
    // Server-side: fallback to environment variable or default
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    const p = path.startsWith('/') ? path : `/${path}`
    return `${baseUrl}${p}`
  }
}
