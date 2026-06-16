export type KafkaSaslConfig = Readonly<{
  mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
  username: string;
  password: string;
}>;

export type KafkaClientConfig = Readonly<{
  brokers: string[];
  ssl?: boolean;
  sasl?: KafkaSaslConfig;
}>;

const readBrokers = (): string[] | null => {
  const rawBrokers = process.env.KAFKA_BROKERS?.trim();

  if (!rawBrokers) {
    return null;
  }

  const brokers = rawBrokers
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

  return brokers.length > 0 ? brokers : null;
};

const readSaslMechanism = (): KafkaSaslConfig['mechanism'] => {
  const mechanism = (process.env.KAFKA_SASL_MECHANISM?.trim() || 'scram-sha-256').toLowerCase();

  if (mechanism === 'scram' || mechanism === 'sasl_ssl') {
    return 'scram-sha-256';
  }

  if (mechanism === 'plain' || mechanism === 'scram-sha-256' || mechanism === 'scram-sha-512') {
    return mechanism;
  }

  throw new Error(
    'KAFKA_SASL_MECHANISM must be one of: plain, scram, scram-sha-256, scram-sha-512.',
  );
};

const looksLikeBrokerAddress = (value: string): boolean =>
  value.includes('.cloud.redpanda.com') || value.includes(':9092');

export const buildKafkaClientConfig = (): KafkaClientConfig | null => {
  const brokers = readBrokers();

  if (!brokers) {
    return null;
  }

  const username = process.env.KAFKA_SASL_USERNAME?.trim();
  const password = process.env.KAFKA_SASL_PASSWORD?.trim();

  if (username && looksLikeBrokerAddress(username)) {
    throw new Error(
      'KAFKA_SASL_USERNAME looks like a broker URL. Use the username from Redpanda Manage credentials.',
    );
  }

  if (!username || !password) {
    return { brokers };
  }

  return {
    brokers,
    ssl: process.env.KAFKA_SSL !== 'false',
    sasl: {
      mechanism: readSaslMechanism(),
      username,
      password,
    },
  };
};
