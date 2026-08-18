import { resolve } from 'node:path';
import { getLoggerConfig } from './config';
import { JsonFileLogSink } from './JsonFileLogSink';
import { sanitizeForLog, serializeForLog } from './sanitize';
import type {
  LogContext,
  LogLevel,
  LoggerConfig,
  LoggerOptions,
  LoggerSink,
  StructuredLogEntry,
  StructuredLogSink,
} from './types';

const levelPriority: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  SUCCESS: 25,
  WARN: 30,
  ERROR: 40,
};

const consoleSink: LoggerSink = {
  write(level, line): void {
    if (level === 'ERROR') {
      console.error(line);
      return;
    }

    if (level === 'WARN') {
      console.warn(line);
      return;
    }

    if (level === 'DEBUG') {
      console.debug(line);
      return;
    }

    console.log(line);
  },
};

const nullSink: LoggerSink = {
  write(): void {
    // File-only output intentionally has no human-readable console sink.
  },
};

export class Logger {
  private readonly config: LoggerConfig;
  private readonly sink: LoggerSink;
  private readonly structuredSink?: StructuredLogSink;
  private readonly now: () => Date;

  constructor(options: LoggerOptions = {}) {
    this.config = {
      ...getLoggerConfig(),
      ...options.config,
    };
    this.now = options.now ?? (() => new Date());
    this.sink = options.sink ?? (this.config.output === 'file' ? nullSink : consoleSink);
    this.structuredSink =
      options.structuredSink ??
      (this.config.output === 'file' || this.config.output === 'both'
        ? new JsonFileLogSink({
            directory: resolve(options.logDirectory ?? 'logs'),
            retentionDays: this.config.retentionDays,
            now: this.now,
          })
        : undefined);
  }

  debug(message: string, context?: LogContext): void {
    this.log('DEBUG', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context);
  }

  success(message: string, context?: LogContext): void {
    this.log('SUCCESS', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, context);
  }

  error(message: string, errorOrContext?: unknown, context?: LogContext): void {
    if (isLogContext(errorOrContext)) {
      this.log('ERROR', message, errorOrContext);
      return;
    }

    this.log('ERROR', message, {
      ...context,
      error: errorOrContext,
    });
  }

  log(level: LogLevel, message: string, context: LogContext = {}): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = this.now();
    const sanitizedMessage = String(sanitizeForLog(message));

    if (this.config.output === 'console' || this.config.output === 'both') {
      this.sink.write(level, this.format(level, sanitizedMessage, context, timestamp));
    }

    if (this.config.output === 'file' || this.config.output === 'both') {
      this.writeStructured({
        timestamp: timestamp.toISOString(),
        level,
        message: sanitizedMessage,
        testName: this.sanitizeText(context.testName),
        step: this.sanitizeText(context.step),
        project: this.sanitizeText(context.project),
        browser: this.sanitizeText(context.browser),
        module: this.sanitizeText(context.module),
        worker: context.worker,
        retry: context.retry,
        durationMs: context.durationMs,
        error: sanitizeForLog(context.error),
        metadata: sanitizeForLog(context.metadata),
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && levelPriority[level] >= levelPriority[this.config.level];
  }

  private format(
    level: LogLevel,
    message: string,
    context: LogContext,
    timestamp: Date,
  ): string {
    const segments = [
      this.formatTimestamp(timestamp),
      `[${level}]`,
      ...this.formatContextSegments(context),
    ];
    const details = this.formatDetails(context);

    return `${segments.join(' ')} ${sanitizeForLog(message)}${details}`;
  }

  private formatTimestamp(timestamp: Date): string {
    return `[${timestamp.toLocaleTimeString('en-GB', { hour12: false })}]`;
  }

  private formatContextSegments(context: LogContext): string[] {
    const execution =
      context.worker !== undefined || context.retry !== undefined
        ? [
            context.worker !== undefined ? `worker ${context.worker}` : undefined,
            context.retry !== undefined ? `retry ${context.retry}` : undefined,
          ]
            .filter((value): value is string => value !== undefined)
            .join(' | ')
        : undefined;

    const project =
      context.project && context.browser
        ? `${context.project} / ${context.browser}`
        : context.project;

    return [project, context.module, context.testName, execution, context.step]
      .filter((segment): segment is string => Boolean(segment?.trim()))
      .map((segment) => `[${sanitizeForLog(segment)}]`);
  }

  private formatDetails(context: LogContext): string {
    const sanitizedMetadata = sanitizeForLog(context.metadata);
    const sanitizedError = sanitizeForLog(context.error);
    const details: string[] = [];

    if (sanitizedMetadata !== undefined) {
      details.push(`metadata=${serializeForLog(sanitizedMetadata)}`);
    }

    if (sanitizedError !== undefined) {
      details.push(`error=${serializeForLog(sanitizedError)}`);
    }

    return details.length > 0 ? ` | ${details.join(' | ')}` : '';
  }

  private writeStructured(entry: StructuredLogEntry): void {
    try {
      this.structuredSink?.write(entry);
    } catch (error) {
      console.error(`[ERROR] [Logger] Structured output failed | error=${serializeForLog(error)}`);
    }
  }

  private sanitizeText(value: string | undefined): string | undefined {
    return value === undefined ? undefined : String(sanitizeForLog(value));
  }
}

function isLogContext(value: unknown): value is LogContext {
  return Boolean(
    value &&
    typeof value === 'object' &&
    ('testName' in value ||
      'project' in value ||
      'browser' in value ||
      'module' in value ||
      'step' in value ||
      'worker' in value ||
      'retry' in value ||
      'durationMs' in value ||
      'metadata' in value ||
      'error' in value),
  );
}
