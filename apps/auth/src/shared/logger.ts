type LogLevel = 'ERROR' | 'INFO';
type LogMetadata = Record<string, unknown>;

export type Logger = Readonly<{
  error: (message: string, metadata?: LogMetadata) => void;
  info: (message: string, metadata?: LogMetadata) => void;
}>;

export const serializeError = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  if (typeof error === 'object' && error !== null) {
    return { ...error };
  }

  return {
    value: String(error),
  };
};

export const createLogger = (service: string): Logger => {
  const write = (level: LogLevel, message: string, metadata?: LogMetadata): void => {
    const entry = {
      level,
      message,
      metadata,
      service,
      timestamp: new Date(),
    };
    const serializedEntry = JSON.stringify(entry);

    if (level === 'ERROR') {
      console.error(serializedEntry);

      return;
    }

    console.info(serializedEntry);
  };

  return {
    error: (message, metadata) => {
      write('ERROR', message, metadata);
    },
    info: (message, metadata) => {
      write('INFO', message, metadata);
    },
  };
};
