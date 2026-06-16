import { NextResponse } from 'next/server';

const TOKEN_KEY = 'accessToken';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function isJwt(token: string): boolean {
  return token.split('.').length === 3;
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const accessToken =
    typeof body === 'object' && body !== null && 'accessToken' in body
      ? (body as { accessToken: unknown }).accessToken
      : undefined;

  if (typeof accessToken !== 'string' || !isJwt(accessToken)) {
    return NextResponse.json({ error: 'Invalid access token' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_KEY, accessToken, {
    path: '/',
    maxAge: MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_KEY, '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
