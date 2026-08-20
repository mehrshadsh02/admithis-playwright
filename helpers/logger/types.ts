export const LOG_LEVELS = ['DEBUG', 'INFO', 'SUCCESS', 'WARN', 'ERROR'] as const;
export const LOG_OUTPUTS = ['console', 'file', 'both'] as const;
export const LOG_MODES = ['OFF', 'NORMAL', 'DEBUG', 'FAILURE', 'FULL'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];
export type LogOutput = (typeof LOG_OUTPUTS)[number];
export type LogMode = (typeof LOG_MODES)[number];

export interface LogContext {
  testName?: string;
  testFile?: string;
  testId?: string;
  project?: string;
  browser?: string;
  module?: string;
  step?: string;
  action?: string;
  target?: string;
  worker?: number;
  retry?: number;
  durationMs?: number;
  metadata?: unknown;
  error?: unknown;
}

export interface LoggerConfig {
  mode: LogMode;
  enabled: boolean;
  level: LogLevel;
  output: LogOutput;
  retentionDays: number;
  actions: boolean;
  api: boolean;
}

export interface PlaywrightArtifactSettings {
  trace: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
  screenshot: 'off' | 'on' | 'only-on-failure';
  video: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
}

export interface LoggerSink {
  write(level: LogLevel, line: string): void;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  testName?: string;
  testFile?: string;
  testId?: string;
  step?: string;
  project?: string;
  browser?: string;
  module?: string;
  action?: string;
  target?: string;
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
