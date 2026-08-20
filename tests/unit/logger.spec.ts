import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  JsonFileLogSink,
  getPlaywrightArtifactSettings,
  getLoggerConfig,
  Logger,
  parseLogActions,
  parseLogApi,
  parseLogEnabled,
  parseLogLevel,
  parseLogMode,
  parseLogOutput,
  parseLogRetentionDays,
  sanitizeForLog,
  serializeForLog,
} from '../../helpers/logger';
import type {
  LogLevel,
  LoggerSink,
  StructuredLogEntry,
  StructuredLogSink,
} from '../../helpers/logger';

class MemorySink implements LoggerSink {
  readonly lines: string[] = [];

  write(_level: LogLevel, line: string): void {
    this.lines.push(line);
  }
}

class StructuredMemorySink implements StructuredLogSink {
  readonly entries: StructuredLogEntry[] = [];

  write(entry: StructuredLogEntry): void {
    this.entries.push(entry);
  }
}

const fixedDate = new Date(2026, 7, 18, 21, 42, 15);

test('logger formats support-readable entries', () => {
  const sink = new MemorySink();
  const logger = new Logger({
    config: { enabled: true, level: 'INFO' },
    sink,
    now: () => fixedDate,
  });

  logger.info('Searching patient', {
    testName: '002-Create Emergency',
    module: 'Admission',
  });

  expect(sink.lines).toEqual([
    '[21:42:15] [INFO] [Admission] [002-Create Emergency] Searching patient',
  ]);
});

test('logger hides debug output unless debug level is configured', () => {
  const sink = new MemorySink();
  const logger = new Logger({
    config: { enabled: true, level: 'INFO' },
    sink,
    now: () => fixedDate,
  });

  logger.debug('Hidden diagnostic');
  logger.success('Visible success');

  expect(sink.lines).toEqual(['[21:42:15] [SUCCESS] Visible success']);
});

test('logger produces no output when logging is disabled', () => {
  const sink = new MemorySink();
  const logger = new Logger({
    config: { enabled: false, level: 'DEBUG' },
    sink,
    now: () => fixedDate,
  });

  logger.debug('Hidden debug');
  logger.info('Hidden info');
  logger.error('Hidden error');

  expect(sink.lines).toEqual([]);
});

test('logger redacts sensitive metadata and error messages', () => {
  const sink = new MemorySink();
  const logger = new Logger({
    config: { enabled: true, level: 'DEBUG' },
    sink,
    now: () => fixedDate,
  });

  logger.error('Request failed token=abc123', new Error('Authorization: Bearer secret-token'), {
    metadata: {
      cookie: 'session-cookie',
      safeId: 42,
    },
  });

  expect(sink.lines[0]).toContain('token=[REDACTED]');
  expect(sink.lines[0]).toContain('"cookie":"[REDACTED]"');
  expect(sink.lines[0]).toContain('"safeId":42');
  expect(sink.lines[0]).toContain('Authorization=[REDACTED]');
  expect(sink.lines[0]).not.toContain('secret-token');
  expect(sink.lines[0]).not.toContain('session-cookie');
});

test('logger redacts secrets embedded in URLs and headers', () => {
  const sink = new MemorySink();
  const logger = new Logger({
    config: { enabled: true, level: 'DEBUG' },
    sink,
    now: () => fixedDate,
  });

  logger.error(
    'Request failed https://example.test/api?token=hidden-token&safe=1',
    {
      metadata: {
        headers: {
          Authorization: 'Bearer hidden-header-token',
          Cookie: 'session=hidden-cookie',
        },
      },
    },
  );

  expect(sink.lines[0]).not.toContain('hidden-token');
  expect(sink.lines[0]).not.toContain('hidden-header-token');
  expect(sink.lines[0]).not.toContain('hidden-cookie');
  expect(sink.lines[0]).toContain('token=[REDACTED]');
  expect(sink.lines[0]).toContain('"Authorization":"[REDACTED]"');
});

test('logger output failures never escape the logging boundary', () => {
  const logger = new Logger({
    config: { enabled: true, level: 'DEBUG', output: 'both' },
    sink: {
      write: () => {
        throw new Error('console sink unavailable');
      },
    },
    structuredSink: {
      write: () => {
        throw new Error('file sink unavailable');
      },
    },
  });

  expect(() => logger.info('still safe')).not.toThrow();
});

test('logger writes structured JSON output to a dated file', () => {
  const directory = mkdtempSync(join(tmpdir(), 'admithis-logger-'));
  const sink = new MemorySink();

  try {
    const logger = new Logger({
      config: { enabled: true, level: 'INFO', output: 'file' },
      sink,
      logDirectory: directory,
      now: () => fixedDate,
    });

    logger.info('File event', {
      testName: 'file test',
      project: 'chrome',
      browser: 'chromium',
      step: 'save',
      worker: 2,
      retry: 1,
      durationMs: 1_250,
      metadata: {
        authorization: 'Bearer hidden-token',
        safeId: 42,
      },
    });

    expect(readdirSync(directory)).toEqual(['test-2026-08-18.log']);
    const entry = JSON.parse(
      readFileSync(join(directory, 'test-2026-08-18.log'), 'utf8'),
    ) as StructuredLogEntry;

    expect(entry).toMatchObject({
      timestamp: fixedDate.toISOString(),
      level: 'INFO',
      message: 'File event',
      testName: 'file test',
      project: 'chrome',
      browser: 'chromium',
      step: 'save',
      worker: 2,
      retry: 1,
      durationMs: 1_250,
      metadata: { authorization: '[REDACTED]', safeId: 42 },
    });
    expect(sink.lines).toEqual([]);
    expect(readFileSync(join(directory, 'test-2026-08-18.log'), 'utf8')).not.toContain(
      'hidden-token',
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('logger supports both console and structured destinations', () => {
  const sink = new MemorySink();
  const structuredSink = new StructuredMemorySink();
  const logger = new Logger({
    config: { enabled: true, level: 'INFO', output: 'both' },
    sink,
    structuredSink,
    now: () => fixedDate,
  });

  logger.success('Both destinations');

  expect(sink.lines).toHaveLength(1);
  expect(structuredSink.entries).toHaveLength(1);
  expect(structuredSink.entries[0]).toMatchObject({
    level: 'SUCCESS',
    message: 'Both destinations',
  });
});

test('file retention removes only old dated log files', () => {
  const directory = mkdtempSync(join(tmpdir(), 'admithis-retention-'));
  const sink = new JsonFileLogSink({
    directory,
    retentionDays: 2,
    now: () => fixedDate,
  });

  try {
    writeFileSync(join(directory, 'test-2026-08-14.log'), 'old\n');
    writeFileSync(join(directory, 'test-2026-08-17.log'), 'recent\n');
    writeFileSync(join(directory, 'keep.txt'), 'untouched\n');

    sink.write({
      timestamp: fixedDate.toISOString(),
      level: 'INFO',
      message: 'retention',
    });

    expect(readdirSync(directory).sort()).toEqual([
      'keep.txt',
      'test-2026-08-17.log',
      'test-2026-08-18.log',
    ]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('sanitizeForLog handles circular metadata safely', () => {
  const metadata: { child?: unknown } = {};
  metadata.child = metadata;

  expect(sanitizeForLog(metadata)).toEqual({
    child: '[Circular]',
  });
  expect(serializeForLog({ count: BigInt(3) })).toBe('{"count":"3n"}');
});

test('logger configuration uses safe defaults and environment overrides', () => {
  expect(parseLogMode(undefined)).toBeUndefined();
  expect(parseLogMode('normal')).toBe('NORMAL');
  expect(parseLogMode('invalid')).toBeUndefined();
  expect(parseLogEnabled(undefined)).toBe(true);
  expect(parseLogEnabled('false')).toBe(false);
  expect(parseLogActions(undefined)).toBe(true);
  expect(parseLogApi('off')).toBe(false);
  expect(parseLogLevel(undefined)).toBe('INFO');
  expect(parseLogLevel('debug')).toBe('DEBUG');
  expect(parseLogLevel('invalid')).toBe('INFO');
  expect(parseLogOutput(undefined)).toBe('console');
  expect(parseLogOutput('FILE')).toBe('file');
  expect(parseLogOutput('invalid')).toBe('console');
  expect(parseLogRetentionDays(undefined)).toBe(7);
  expect(parseLogRetentionDays('0')).toBe(0);
  expect(parseLogRetentionDays('-1')).toBe(7);
  expect(
    getLoggerConfig({
      LOG_ENABLED: '0',
      LOG_LEVEL: 'ERROR',
      LOG_OUTPUT: 'both',
      LOG_RETENTION_DAYS: '14',
      LOG_ACTIONS: '0',
      LOG_API: 'false',
    }),
  ).toEqual({
    mode: 'OFF',
    enabled: false,
    level: 'ERROR',
    output: 'both',
    retentionDays: 14,
    actions: false,
    api: false,
  });
});

test('logger configuration supports every logging mode', () => {
  expect(getLoggerConfig({ LOG_MODE: 'OFF' })).toMatchObject({
    mode: 'OFF',
    enabled: false,
    level: 'INFO',
  });
  expect(getLoggerConfig({ LOG_MODE: 'NORMAL' })).toMatchObject({
    mode: 'NORMAL',
    enabled: true,
    level: 'INFO',
  });
  expect(getLoggerConfig({ LOG_MODE: 'DEBUG' })).toMatchObject({
    mode: 'DEBUG',
    enabled: true,
    level: 'DEBUG',
  });
  expect(getLoggerConfig({ LOG_MODE: 'FAILURE' })).toMatchObject({
    mode: 'FAILURE',
    enabled: true,
    level: 'INFO',
  });
  expect(getLoggerConfig({ LOG_MODE: 'FULL' })).toMatchObject({
    mode: 'FULL',
    enabled: true,
    level: 'DEBUG',
  });
});

test('logger configuration derives safe modes from existing variables', () => {
  expect(getLoggerConfig({ LOG_ENABLED: 'false' }).mode).toBe('OFF');
  expect(getLoggerConfig({ LOG_LEVEL: 'DEBUG' }).mode).toBe('DEBUG');
  expect(getLoggerConfig({ LOG_LEVEL: 'INFO' }).mode).toBe('NORMAL');
  expect(getLoggerConfig({ LOG_MODE: 'invalid', LOG_LEVEL: 'DEBUG' })).toMatchObject({
    mode: 'DEBUG',
    level: 'DEBUG',
  });
});

test('artifact settings are enabled only for failure and full modes', () => {
  const current = {
    trace: 'off' as const,
    screenshot: 'off' as const,
    video: 'off' as const,
  };

  expect(getPlaywrightArtifactSettings('OFF', current)).toEqual(current);
  expect(getPlaywrightArtifactSettings('NORMAL', current)).toEqual(current);
  expect(getPlaywrightArtifactSettings('DEBUG', current)).toEqual(current);
  expect(getPlaywrightArtifactSettings('FAILURE', current)).toEqual({
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  });
  expect(getPlaywrightArtifactSettings('FULL', current)).toEqual({
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  });
});

test('disabled logging takes precedence over a requested diagnostic mode', () => {
  expect(getLoggerConfig({ LOG_ENABLED: 'false', LOG_MODE: 'FULL' })).toMatchObject({
    mode: 'OFF',
    enabled: false,
  });
});
