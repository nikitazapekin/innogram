type AuthGatewayPayload = Readonly<{
  login: string;
  password: string;
}>;

const getApiGatewayUrl = (): string => process.env.API_GATEWAY_URL || 'http://localhost:3002';

export const forwardAuthPayload = async (
  path: string,
  payload: AuthGatewayPayload,
): Promise<void> => {
  const response = await fetch(`${getApiGatewayUrl()}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API gateway request failed with status ${response.status}.`);
  }
};
