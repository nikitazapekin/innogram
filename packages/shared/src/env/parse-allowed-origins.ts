const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'] as const;

export const parseAllowedOrigins = (): readonly string[] => {
  const configured = process.env.ALLOWED_ORIGINS?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return configured && configured.length > 0 ? configured : [...DEFAULT_ALLOWED_ORIGINS];
};
