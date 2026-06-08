import { createSign, generateKeyPairSync } from 'node:crypto';

export const TEST_JWT_KID = 'integration-test-key';

const keyPair = generateKeyPairSync('rsa', { modulusLength: 2048 });

export const testPublicKeyPem = keyPair.publicKey
  .export({ type: 'spki', format: 'pem' })
  .toString();

export const createTestAccessToken = (email: string): string => {
  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: TEST_JWT_KID }),
  ).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      email,
      sub: email,
      exp: now + 3600,
      iat: now,
      tokenType: 'access',
    }),
  ).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = createSign('RSA-SHA256').update(data).sign(keyPair.privateKey, 'base64url');

  return `${data}.${signature}`;
};
