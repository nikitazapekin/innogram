import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { KafkaJsInstrumentation } from '@opentelemetry/instrumentation-kafkajs';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';

export interface TracingOptions {
  serviceName: string;
  serviceVersion?: string;
  tempoUrl?: string;
}

let sdk: NodeSDK | null = null;

export function initTracing(options: TracingOptions): void {
  const tempoUrl =
    options.tempoUrl ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318';

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: options.serviceName,
    [ATTR_SERVICE_VERSION]: options.serviceVersion ?? process.env.APP_VERSION ?? '1.0.0',
  });

  const exporter = new OTLPTraceExporter({
    url: `${tempoUrl}/v1/traces`,
  });

  sdk = new NodeSDK({
    resource,
    spanProcessors: [new SimpleSpanProcessor(exporter)],
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new PgInstrumentation(),
      new KafkaJsInstrumentation(),
      new IORedisInstrumentation(),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk
      ?.shutdown()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  });
}
