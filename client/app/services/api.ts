// Same-origin by default; Next proxies API calls to the configured backend.
const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Sign in to save your activity.');
  const response = await fetch(`${base}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (!response.ok) {
    let detail = response.status === 401 ? 'Your session expired. Please sign in again.' : 'Could not load your workspace. Please try again.';
    try {
      const body = await response.json();
      if (typeof body.detail === 'string') detail = body.detail;
    } catch { /* Keep the readable fallback for non-JSON errors. */ }
    throw new Error(detail);
  }
  return response.json();
}
