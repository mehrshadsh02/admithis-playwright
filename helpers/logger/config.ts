import {
  LOG_LEVELS,
  LOG_MODES,
  LOG_OUTPUTS,
  type LogLevel,
  type LogMode,
  type LoggerConfig,
  type LogOutput,
  type PlaywrightArtifactSettings,
} from './types';

const disabledValues = new Set(['0', 'false', 'off', 'no']);
export const DEFAULT_LOG_RETENTION_DAYS = 7;

export function parseLogMode(value: string | undefined): LogMode | undefined {
  const normalized = value?.trim().toUpperCase();

  if (normalized && LOG_MODES.includes(normalized as LogMode)) {
    return normalized as LogMode;
  }

  return undefined;
}

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

export function parseLogActions(value: string | undefined): boolean {
  return parseLogEnabled(value);
}

export function parseLogApi(value: string | undefined): boolean {
  return parseLogEnabled(value);
}

export function getPlaywrightArtifactSettings(
  mode: LogMode,
  current: PlaywrightArtifactSettings,
): PlaywrightArtifactSettings {
  if (mode === 'FAILURE') {
    return {
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    };
  }

  if (mode === 'FULL') {
    return {
      trace: 'on',
      screenshot: 'on',
      video: 'on',
    };
  }

  return current;
}

export function getLoggerConfig(env: NodeJS.ProcessEnv = process.env): LoggerConfig {
  const enabled = parseLogEnabled(env.LOG_ENABLED);
  const level = parseLogLevel(env.LOG_LEVEL);
  const requestedMode = parseLogMode(env.LOG_MODE);
  const mode = !enabled ? 'OFF' : (requestedMode ?? (level === 'DEBUG' ? 'DEBUG' : 'NORMAL'));
  const modeLevel: LogLevel = mode === 'DEBUG' || mode === 'FULL' ? 'DEBUG' : 'INFO';

  return {
    mode,
    enabled: enabled && mode !== 'OFF',
    level: requestedMode ? modeLevel : level,
    output: parseLogOutput(env.LOG_OUTPUT),
    retentionDays: parseLogRetentionDays(env.LOG_RETENTION_DAYS),
    actions: parseLogActions(env.LOG_ACTIONS),
    api: parseLogApi(env.LOG_API),
  };
}
