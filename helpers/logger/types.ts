export const LOG_LEVELS = ['DEBUG', 'INFO', 'SUCCESS', 'WARN', 'ERROR'] as const;
export const LOG_OUTPUTS = ['console', 'file', 'both'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];
export type LogOutput = (typeof LOG_OUTPUTS)[number];

export interface LogContext {
  testName?: string;
  project?: string;
  browser?: string;
  module?: string;
  step?: string;
  worker?: number;
  retry?: number;
  durationMs?: number;
  metadata?: unknown;
  error?: unknown;
}

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  output: LogOutput;
  retentionDays: number;
}

export interface LoggerSink {
  write(level: LogLevel, line: string): void;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  testName?: string;
  step?: string;
  project?: string;
  browser?: string;
  module?: string;
  worker?: number;
  retry?: number;
  durationMs?: number;
  error?: unknown;
  metadata?: unknown;
}

export interface StructuredLogSink {
  write(entry: StructuredLogEntry): void;
}

export interface LoggerOptions {
  config?: Partial<LoggerConfig>;
  sink?: LoggerSink;
  structuredSink?: StructuredLogSink;
  logDirectory?: string;
  now?: () => Date;
}
