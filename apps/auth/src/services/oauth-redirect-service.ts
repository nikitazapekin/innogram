export const createOAuthRedirectUrl = (
  redirectUri: string,
  params: Readonly<Record<string, string>>,
): string => {
  const url = new URL(redirectUri);

  url.hash = new URLSearchParams(params).toString();

  return url.toString();
};
