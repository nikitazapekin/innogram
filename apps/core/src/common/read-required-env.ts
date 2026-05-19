export const readRequiredEnv = (envName: string): string => {
  const value = process.env[envName];

  if (!value) {
    throw new Error(`Missing required variable: ${envName}`);
  }

  return value;
};
