const KEY = 'te_return_to';
const TTL_MS = 15 * 60 * 1000; // invite links go stale after 15 minutes

/** Persist an internal path to return to after the auth dance (login → register
 *  → email verify → login). Buyer flows only — ManagerLogin deliberately ignores
 *  this store so an abandoned buyer invite can never hijack a manager login. */
export function saveReturnPath(path: string | undefined | null): void {
  if (!path || !path.startsWith('/')) return;
  try { sessionStorage.setItem(KEY, JSON.stringify({ path, ts: Date.now() })); } catch { /* ignore */ }
}

/** Read without clearing (for UI like the invite banner). */
export function peekReturnPath(): string | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const { path, ts } = JSON.parse(raw);
    if (typeof path !== 'string' || !path.startsWith('/') || Date.now() - ts > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return path;
  } catch { return null; }
}

/** Read AND clear — call exactly once, at the moment of post-auth navigation. */
export function consumeReturnPath(): string | null {
  const path = peekReturnPath();
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
  return path;
}
