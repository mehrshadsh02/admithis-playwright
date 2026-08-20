import { expect, test } from '@playwright/test';
import type { BrowserContext, Request, Response } from '@playwright/test';
import {
  attachPlaywrightNetworkLogger,
  type NetworkLogContext,
} from '../../helpers/logger/PlaywrightNetworkLogger';
import { Logger } from '../../helpers/logger';
import type { LogLevel, LoggerSink } from '../../helpers/logger';

class MemorySink implements LoggerSink {
  readonly lines: string[] = [];

  write(_level: LogLevel, line: string): void {
    this.lines.push(line);
  }
}

class ContextEmitter {
  private readonly handlers = new Map<string, ((value: unknown) => void)[]>();

  on(event: string, handler: (value: unknown) => void): this {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
    return this;
  }

  emit(event: string, value: unknown): void {
    for (const handler of this.handlers.get(event) ?? []) {
      handler(value);
    }
  }
}

function logContext(): NetworkLogContext {
  return {
    testName: 'network logging',
    project: 'chrome',
    browser: 'chromium',
    worker: 1,
    retry: 0,
  };
}

function request(overrides: Partial<Request> = {}): Request {
  return {
    method: () => 'POST',
    url: () => 'http://example.test/api?token=secret-token',
    resourceType: () => 'xhr',
    failure: () => ({ errorText: 'net::ERR_FAILED' }),
    ...overrides,
  } as unknown as Request;
}

test('network logger records sanitized request and response failures', () => {
  const sink = new MemorySink();
  const logger = new Logger({
    config: { enabled: true, level: 'DEBUG' },
    sink,
  });
  const context = new ContextEmitter();
  const failedRequest = request();
  const failedResponse = {
    status: () => 503,
    statusText: () => 'Service Unavailable',
    request: () => failedRequest,
    url: () => failedRequest.url(),
  } as unknown as Response;

  attachPlaywrightNetworkLogger(context as unknown as BrowserContext, logContext(), { logger });
  context.emit('requestfailed', failedRequest);
  context.emit('response', failedResponse);

  expect(sink.lines).toHaveLength(2);
  expect(sink.lines[0]).toContain('API REQUEST FAILED');
  expect(sink.lines[0]).toContain('action=request');
  expect(sink.lines[0]).toContain('token=[REDACTED]');
  expect(sink.lines[0]).not.toContain('secret-token');
  expect(sink.lines[1]).toContain('API RESPONSE FAILED');
  expect(sink.lines[1]).toContain('status');
});

test('network logger ignores non-API responses', () => {
  const sink = new MemorySink();
  const logger = new Logger({
    config: { enabled: true, level: 'DEBUG' },
    sink,
  });
  const context = new ContextEmitter();
  const assetRequest = request({ resourceType: () => 'script' });

  attachPlaywrightNetworkLogger(context as unknown as BrowserContext, logContext(), { logger });
  context.emit('requestfailed', assetRequest);

  expect(sink.lines).toEqual([]);
});
