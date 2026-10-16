export function remainingSeconds(deadline: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
export function focusStorageKey(token: string | null): string | null {
  if (!token) return null;
  try {
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(segment));
    return typeof payload.sub === 'string' ? `cop.focus.v1:${payload.sub}` : null;
  } catch { return null; }
}
