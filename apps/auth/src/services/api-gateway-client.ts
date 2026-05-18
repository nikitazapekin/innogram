type AuthGatewayPayload = Readonly<{
  login: string;
  password: string;
}>;

const readRequiredEnv = (envName: string): string => {
  const value = process.env[envName];

  if (!value) {
    throw new Error(`Missing required variable: ${envName}`);
  }

  return value;
};

const getApiGatewayUrl = (): string => readRequiredEnv('API_GATEWAY_URL');

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
