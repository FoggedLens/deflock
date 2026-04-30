import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { metrics } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

export { SeverityNumber };

const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://127.0.0.1:4318';

const resource = resourceFromAttributes({
  'service.name': 'deflock-api',
  'deployment.environment': process.env.NODE_ENV ?? 'production',
});

const loggerProvider = new LoggerProvider({
  resource,
  processors: [
    new BatchLogRecordProcessor(new OTLPLogExporter({ url: `${OTEL_ENDPOINT}/v1/logs` })),
  ],
});
logs.setGlobalLoggerProvider(loggerProvider);

const meterProvider = new MeterProvider({
  resource,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({ url: `${OTEL_ENDPOINT}/v1/metrics` }),
      exportIntervalMillis: 60_000,
    }),
  ],
});
metrics.setGlobalMeterProvider(meterProvider);

export const otelLogger = logs.getLogger('deflock-api', '1.0.0');
export const meter = metrics.getMeter('deflock-api', '1.0.0');
