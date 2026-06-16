const TOKEN_KEY = 'accessToken';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function buildCookieAttributes(maxAge: number): string {
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';

  return `path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function setAccessToken(token: string): void {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; ${buildCookieAttributes(MAX_AGE_SECONDS)}`;
}

export function getAccessToken(): string | undefined {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${TOKEN_KEY}=`));

  if (!match) {
    return undefined;
  }

  const value = match.slice(TOKEN_KEY.length + 1);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function removeAccessToken(): void {
  document.cookie = `${TOKEN_KEY}=; ${buildCookieAttributes(0)}`;
}

export async function persistAccessToken(token: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken: token }),
  });

  if (!response.ok) {
    throw new Error('Failed to persist session');
  }

  setAccessToken(token);
}

export async function clearAccessToken(): Promise<void> {
  await fetch('/api/auth/session', { method: 'DELETE' });
  removeAccessToken();
}
