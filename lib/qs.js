export function buildQueryString(params) {
  const sp = new URLSearchParams();
  if (!params) return '';
  for (const [key, value] of Object.entries(params)) {
    if (typeof key !== 'string') continue;
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v != null) sp.append(key, String(v));
      }
    } else {
      sp.append(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs;
}


