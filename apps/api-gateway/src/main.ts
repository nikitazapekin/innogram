import 'reflect-metadata';

import type { IncomingHttpHeaders } from 'node:http';
import type { Request, Response } from 'express';
import { Readable } from 'node:stream';

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

const readRequiredEnv = (envName: string): string => {
  const value = process.env[envName]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }

  return value;
};

const readApiGatewayPort = (): number => {
  const rawPort = readRequiredEnv('API_GATEWAY_PORT');
  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error('Variable API_GATEWAY_PORT must be a positive integer.');
  }

  return parsedPort;
};

const readAuthServiceUrl = (): string => readRequiredEnv('AUTH_SERVICE_URL');

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

const buildUpstreamUrl = (serviceUrl: string, originalUrl: string | undefined): string => {
  if (!originalUrl) {
    return `${serviceUrl}/`;
  }

  return `${serviceUrl}${originalUrl}`;
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

const API_GATEWAY_PORT = readApiGatewayPort();
const AUTH_SERVICE_URL = readAuthServiceUrl();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    },
  });

  app.use(async (request: Request, response: Response) => {
    try {
      const method = request.method.toUpperCase();
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

      const upstreamResponse = await fetch(
        buildUpstreamUrl(AUTH_SERVICE_URL, request.originalUrl),
        fetchOptions,
      );

      response.status(upstreamResponse.status);
      applyUpstreamHeaders(response, upstreamResponse.headers);

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

void bootstrap();
