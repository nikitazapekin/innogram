const TOKEN_KEY = 'accessToken';

export function setAccessToken(token: string): void {
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function getAccessToken(): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${TOKEN_KEY}=`))
    ?.split('=')[1];
}

export function removeAccessToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
