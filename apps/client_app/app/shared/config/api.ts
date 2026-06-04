export const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_URL ?? 'http://localhost:3001';

export function getCoreAssetUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${CORE_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
