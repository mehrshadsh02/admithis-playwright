import type { BrowserContext, Request } from '@playwright/test';
import { logger as defaultLogger, type Logger } from './index';
import type { LogContext } from './types';

export interface NetworkLogContext extends LogContext {
  testName: string;
  project: string;
  browser?: string;
  worker: number;
  retry: number;
}

export interface PlaywrightNetworkLoggerOptions {
  logger?: Logger;
}

export function attachPlaywrightNetworkLogger(
  context: BrowserContext,
  logContext: NetworkLogContext,
  options: PlaywrightNetworkLoggerOptions = {},
): void {
  const logger = options.logger ?? defaultLogger;

  try {
    if (!logger.isApiLoggingEnabled()) {
      return;
    }
  } catch {
    return;
  }

  context.on('requestfailed', (request) => {
    if (!isApiRequest(request)) {
      return;
    }

    const failure = request.failure();
    try {
      logger.error('API REQUEST FAILED', {
        ...logContext,
        action: 'request',
        target: request.url(),
        error: failure ? { errorText: failure.errorText } : undefined,
        metadata: {
          method: request.method(),
          resourceType: request.resourceType(),
        },
      });
    } catch {
      // Observability failures must not affect the browser event or test result.
    }
  });

  context.on('response', (response) => {
    if (response.status() < 400 || !isApiRequest(response.request())) {
      return;
    }

    try {
      logger.error('API RESPONSE FAILED', {
        ...logContext,
        action: 'response',
        target: response.url(),
        metadata: {
          method: response.request().method(),
          status: response.status(),
          statusText: response.statusText(),
          resourceType: response.request().resourceType(),
        },
      });
    } catch {
      // Observability failures must not affect the browser event or test result.
    }
  });
}

function isApiRequest(request: Request): boolean {
  const resourceType = request.resourceType();
  return resourceType === 'xhr' || resourceType === 'fetch';
}
