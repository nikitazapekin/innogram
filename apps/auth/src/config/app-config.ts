import { config as loadEnvironment } from 'dotenv';

const DEFAULT_PORT = 3002;

export type AppConfig = Readonly<{
  port: number;
}>;

const readPort = (): number => {
  const rawValue = process.env.AUTH_HTTP_PORT?.trim() || process.env.PORT?.trim();

  if (!rawValue) {
    return DEFAULT_PORT;
  }

  const port = Number(rawValue);

  return port;
};

export const loadConfig = (): AppConfig => {
  loadEnvironment();

  return {
    port: readPort(),
  };
};
