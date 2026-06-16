export const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_URL ?? 'http://localhost:3001';

export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:3004';

export function getCoreAssetUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  let normalizedPath: string;
  if (path.startsWith('/')) {
    normalizedPath = path;
  } else {
    normalizedPath = `/${path}`;
  }

  return `${CORE_API_URL}${normalizedPath}`;
}
