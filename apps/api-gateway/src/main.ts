import 'reflect-metadata';

import type { IncomingHttpHeaders } from 'node:http';
import type { Request, Response } from 'express';
import { Readable } from 'node:stream';

import { parseAllowedOrigins } from '@innogram/shared';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { loadEnvironment } from './config/load-environment';

loadEnvironment();

const REQUEST_HEADERS_TO_SKIP = new Set([
  'connection',
  'content-length',
  'host',
  'transfer-encoding',
]);

const RESPONSE_HEADERS_TO_SKIP = new Set([
  'connection',
  'content-length',
  'transfer-encoding',
  'access-control-allow-origin',
  'access-control-expose-headers',
  'access-control-max-age',
  'access-control-allow-credentials',
  'access-control-allow-methods',
  'access-control-allow-headers',
]);

const readRequiredString = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const buildProxyRequestHeaders = (headers: IncomingHttpHeaders): Headers => {
  const result = new Headers();

  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (headerValue === undefined) {
      continue;
    }

    if (REQUEST_HEADERS_TO_SKIP.has(headerName.toLowerCase())) {
      continue;
    }

    if (Array.isArray(headerValue)) {
      for (const item of headerValue) {
        result.append(headerName, item);
      }

      continue;
    }

    result.set(headerName, headerValue);
  }

  return result;
};

const requestHasBody = (method: string): boolean => {
  const normalizedMethod = method.toUpperCase();

  if (normalizedMethod === 'GET') {
    return false;
  }

  if (normalizedMethod === 'HEAD') {
    return false;
  }

  return true;
};

const toRequestBodyStream = (stream: Readable): ReadableStream<Uint8Array> =>
  Readable.toWeb(stream);

const applyUpstreamHeaders = (response: Response, headers: Headers): void => {
  headers.forEach((headerValue, headerName) => {
    if (RESPONSE_HEADERS_TO_SKIP.has(headerName.toLowerCase())) {
      return;
    }

    response.setHeader(headerName, headerValue);
  });
};

const buildUpstreamUrl = (baseUrl: string, path: string | undefined): string => {
  return `${baseUrl}${path ?? '/'}`;
};

const AUTH_ROUTE_PREFIX = '/auth';

const resolveUpstreamUrl = (originalUrl: string | undefined): string => {
  if (originalUrl?.startsWith(AUTH_ROUTE_PREFIX)) {
    return buildUpstreamUrl(AUTH_SERVICE_URL, originalUrl);
  }

  return buildUpstreamUrl(CORE_URL, originalUrl);
};

const API_GATEWAY_PORT = (() => {
  const rawPort = readRequiredString(process.env.API_GATEWAY_PORT, 'API_GATEWAY_PORT');
  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error('Variable API_GATEWAY_PORT must be a positive integer.');
  }

  return parsedPort;
})();

const AUTH_SERVICE_URL = readRequiredString(process.env.AUTH_SERVICE_URL, 'AUTH_SERVICE_URL');
const CORE_URL = readRequiredString(process.env.CORE_URL, 'CORE_URL');

const ALLOWED_ORIGINS = parseAllowedOrigins();

const corsMiddleware = (request: Request, response: Response, next: () => void): void => {
  const origin = request.header('origin');

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(204).end();

    return;
  }

  next();
};

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(corsMiddleware);
  app.use(async (request: Request, response: Response) => {
    try {
      const method = request.method.toUpperCase();

      if (method === 'OPTIONS') {
        return;
      }

      const proxyRequestHasBody = requestHasBody(method);
      const fetchOptions: RequestInit & { duplex?: 'half' } = {
        method,
        headers: buildProxyRequestHeaders(request.headers),
        redirect: 'manual',
      };

      if (proxyRequestHasBody) {
        fetchOptions.body = toRequestBodyStream(request);
        fetchOptions.duplex = 'half';
      }

      const upstreamResponse = await fetch(resolveUpstreamUrl(request.originalUrl), fetchOptions);

      const status = upstreamResponse.status;

      if (status >= 300 && status < 400) {
        const location = upstreamResponse.headers.get('location');

        if (location) {
          response.redirect(status, location);

          return;
        }
      }

      response.status(status);
      applyUpstreamHeaders(response, upstreamResponse.headers);
      applyCorsHeaders(response, request.header('origin'));

      const responseBody = Buffer.from(await upstreamResponse.arrayBuffer());

      response.send(responseBody);
    } catch (error) {
      response.status(500).json({
        error: 'internal_server_error',
        message: error instanceof Error ? error.message : 'Internal server error.',
      });
    }
  });

  await app.listen(API_GATEWAY_PORT);
}

const applyCorsHeaders = (response: Response, origin: string | undefined): void => {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
  }
};

void bootstrap();
