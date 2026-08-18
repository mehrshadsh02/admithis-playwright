import {
  LOG_LEVELS,
  LOG_OUTPUTS,
  type LogLevel,
  type LoggerConfig,
  type LogOutput,
} from './types';

const disabledValues = new Set(['0', 'false', 'off', 'no']);
export const DEFAULT_LOG_RETENTION_DAYS = 7;

export function parseLogEnabled(value: string | undefined): boolean {
  if (value === undefined || value.trim() === '') {
    return true;
  }

  return !disabledValues.has(value.trim().toLowerCase());
}

export function parseLogLevel(value: string | undefined): LogLevel {
  const normalized = value?.trim().toUpperCase();

  if (normalized && LOG_LEVELS.includes(normalized as LogLevel)) {
    return normalized as LogLevel;
  }

  return 'INFO';
}

export function parseLogOutput(value: string | undefined): LogOutput {
  const normalized = value?.trim().toLowerCase();

  if (normalized && LOG_OUTPUTS.includes(normalized as LogOutput)) {
    return normalized as LogOutput;
  }

  return 'console';
}

export function parseLogRetentionDays(value: string | undefined): number {
  if (value === undefined || value.trim() === '') {
    return DEFAULT_LOG_RETENTION_DAYS;
  }

  const parsed = Number(value.trim());

  if (Number.isInteger(parsed) && parsed >= 0) {
    return parsed;
  }

  return DEFAULT_LOG_RETENTION_DAYS;
}

export function getLoggerConfig(env: NodeJS.ProcessEnv = process.env): LoggerConfig {
  return {
    enabled: parseLogEnabled(env.LOG_ENABLED),
    level: parseLogLevel(env.LOG_LEVEL),
    output: parseLogOutput(env.LOG_OUTPUT),
    retentionDays: parseLogRetentionDays(env.LOG_RETENTION_DAYS),
  };
}
