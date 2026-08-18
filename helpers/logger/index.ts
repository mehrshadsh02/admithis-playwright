import { Logger } from './Logger';

export {
  DEFAULT_LOG_RETENTION_DAYS,
  getLoggerConfig,
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
  LogOutput,
  LoggerConfig,
  LoggerOptions,
  LoggerSink,
  StructuredLogEntry,
  StructuredLogSink,
} from './types';

export const logger = new Logger();
