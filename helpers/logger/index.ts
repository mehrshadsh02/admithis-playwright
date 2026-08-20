import { Logger } from './Logger';

export {
  DEFAULT_LOG_RETENTION_DAYS,
  getPlaywrightArtifactSettings,
  getLoggerConfig,
  parseLogMode,
  parseLogActions,
  parseLogApi,
  parseLogEnabled,
  parseLogLevel,
  parseLogOutput,
  parseLogRetentionDays,
} from './config';
export { Logger } from './Logger';
export { JsonFileLogSink } from './JsonFileLogSink';
export { REDACTED, sanitizeForLog, serializeForLog } from './sanitize';
export type {
  LogContext,
  LogLevel,
  LogMode,
  LogOutput,
  LoggerConfig,
  LoggerOptions,
  PlaywrightArtifactSettings,
  LoggerSink,
  StructuredLogEntry,
  StructuredLogSink,
} from './types';

export const logger = new Logger();
