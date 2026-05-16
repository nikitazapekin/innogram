import 'reflect-metadata';

import type { IncomingHttpHeaders } from 'node:http';
import type { Request, Response } from 'express';
import { Readable } from 'node:stream';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { loadEnvironment } from './config/load-environment';

loadEnvironment();

const DEFAULT_API_GATEWAY_PORT = 3004;
const DEFAULT_AUTH_SERVICE_URL = 'http://localhost:3002';

const REQUEST_HEADERS_TO_SKIP = new Set([
  'connection',
  'content-length',
  'host',
  'transfer-encoding',
]);

const RESPONSE_HEADERS_TO_SKIP = new Set(['connection', 'content-length', 'transfer-encoding']);

const readApiGatewayPort = (): number => {
  const rawPort = process.env.API_GATEWAY_PORT;

  if (!rawPort) {
    return DEFAULT_API_GATEWAY_PORT;
  }

  return Number(rawPort);
};

const readAuthServiceUrl = (): string => {
  const rawUrl = process.env.AUTH_SERVICE_URL;

  if (!rawUrl) {
    return DEFAULT_AUTH_SERVICE_URL;
  }

  return rawUrl.trim();
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

const buildUpstreamUrl = (serviceUrl: string, originalUrl: string | undefined): string => {
  if (!originalUrl) {
    return `${serviceUrl}/`;
  }

  return `${serviceUrl}${originalUrl}`;
};

const toRequestBodyStream = (stream: Readable): ReadableStream<Uint8Array> =>
  Readable.toWeb(stream) as ReadableStream<Uint8Array>;

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
      response.status(502).json({
        error: 'bad_gateway',
        message: error instanceof Error ? error.message : 'Failed to reach upstream service.',
      });
    }
  });

  await app.listen(API_GATEWAY_PORT);
}

void bootstrap();
