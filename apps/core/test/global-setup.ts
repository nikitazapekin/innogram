import { isDatabaseReachable } from './integration/db';

export default async (): Promise<void> => {
  process.env.TEST_DB_AVAILABLE = String(await isDatabaseReachable());
};
