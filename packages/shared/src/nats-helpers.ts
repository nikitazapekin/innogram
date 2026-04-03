import { Logger } from '@nestjs/common';
import { NatsRecordBuilder } from '@nestjs/microservices';
import * as nats from 'nats';

export type HeaderMap = Record<string, string | string[] | undefined>;

export function buildNatsRecord<T>(data: T, headers: Record<string, string>) {
  const rawHeaders = nats.headers();

  for (const [key, value] of Object.entries(headers)) {
    rawHeaders.set(key, value);
  }

  return new NatsRecordBuilder(data).setHeaders(rawHeaders).build();
}

export function normalizeHeaders(raw?: unknown): HeaderMap {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const maybeHeaders = raw as {
    keys?: () => Iterable<string>;
    get?: (key: string) => string | string[] | undefined;
  };

  if (typeof maybeHeaders.keys !== 'function' || typeof maybeHeaders.get !== 'function') {
    return raw as HeaderMap;
  }

  const headers: HeaderMap = {};

  for (const key of maybeHeaders.keys()) {
    headers[key] = maybeHeaders.get(key);
  }

  return headers;
}

export function readHeader(value: string | string[] | undefined, fallback: string): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}
 