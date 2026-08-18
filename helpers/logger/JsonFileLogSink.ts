import { appendFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import type { StructuredLogEntry, StructuredLogSink } from './types';
import { serializeForLog } from './sanitize';

export interface JsonFileLogSinkOptions {
  directory: string;
  retentionDays: number;
  now?: () => Date;
}

const logFilePattern = /^test-(\d{4}-\d{2}-\d{2})\.log$/;
const millisecondsPerDay = 24 * 60 * 60 * 1_000;

export class JsonFileLogSink implements StructuredLogSink {
  private readonly directory: string;
  private readonly retentionDays: number;
  private readonly now: () => Date;
  private lastCleanupDate?: string;

  constructor(options: JsonFileLogSinkOptions) {
    this.directory = options.directory;
    this.retentionDays = options.retentionDays;
    this.now = options.now ?? (() => new Date());
  }

  write(entry: StructuredLogEntry): void {
    const date = this.entryDate(entry);

    mkdirSync(this.directory, { recursive: true });

    if (this.lastCleanupDate !== date) {
      this.cleanup(date);
      this.lastCleanupDate = date;
    }

    appendFileSync(join(this.directory, `test-${date}.log`), `${serializeForLog(entry)}\n`, 'utf8');
  }

  private entryDate(entry: StructuredLogEntry): string {
    const date = entry.timestamp.slice(0, 10);

    return logFilePattern.test(`test-${date}.log`) ? date : this.formatDate(this.now());
  }

  private cleanup(currentDate: string): void {
    const cutoff =
      Date.parse(`${currentDate}T00:00:00.000Z`) - this.retentionDays * millisecondsPerDay;

    for (const fileName of readdirSync(this.directory)) {
      const match = logFilePattern.exec(fileName);

      if (!match) {
        continue;
      }

      const fileDate = Date.parse(`${match[1]}T00:00:00.000Z`);

      if (fileDate < cutoff) {
        unlinkSync(join(this.directory, fileName));
      }
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
