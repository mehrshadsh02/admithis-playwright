import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestError,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';
import { logger as defaultLogger, type LogContext, type Logger } from './index';

interface PlaywrightLoggerReporterOptions {
  logger?: Logger;
}

interface PlaywrightErrorDetails {
  type: string;
  message: string;
  stack?: string;
  snippet?: string;
  location?: {
    file: string;
    line: number;
    column: number;
  };
  cause?: PlaywrightErrorDetails;
}

interface PlaywrightAction {
  action: string;
  target: string;
}

interface FailureSummary {
  testName: string;
  testFile?: string;
  testId: string;
  project?: string;
  browser?: string;
  worker?: number;
  step?: string;
  message: string;
  action?: string;
  target?: string;
  retry: number;
  artifacts: string[];
}

interface AttemptRecord {
  status: TestResult['status'];
  duration: number;
  failure?: FailureSummary;
}

const actionPattern =
  /\b(locator|page|frameLocator|elementHandle|browserContext)\.(click|fill|press|selectOption|check|uncheck|goto|reload|waitForURL|hover|dblclick|tap|focus|clear)\b/i;

export default class PlaywrightLoggerReporter implements Reporter {
  private readonly logger: Logger;
  private readonly attempts = new Map<string, AttemptRecord[]>();
  private readonly stepFailures = new Map<string, FailureSummary>();

  constructor(options: PlaywrightLoggerReporterOptions = {}) {
    this.logger = options.logger ?? defaultLogger;
  }

  private safeLog(
    level: 'debug' | 'info' | 'warn' | 'error' | 'success',
    message: string,
    details?: unknown,
    context?: LogContext,
  ): void {
    try {
      switch (level) {
        case 'debug':
          this.logger.debug(message, context);
          break;
        case 'info':
          this.logger.info(message, context);
          break;
        case 'warn':
          this.logger.warn(message, context);
          break;
        case 'error':
          this.logger.error(message, details, context);
          break;
        case 'success':
          this.logger.success(message, context);
          break;
      }
    } catch (error) {
      this.writeReporterFallback(level, message, error);
    }
  }

  private writeReporterFallback(
    level: string,
    message: string,
    error: unknown,
  ): void {
    try {
      const loggerError =
        error instanceof Error ? error.message : String(error);

      process.stderr.write(
        `[PlaywrightLoggerReporter:${level}] ${message} | logger-error=${loggerError}\n`,
      );
    } catch {
      // Intentionally ignored: reporter failures must never mask test failures.
    }
  }

  private actionLoggingEnabled(): boolean {
    try {
      return this.logger.isActionLoggingEnabled();
    } catch (error) {
      this.writeReporterFallback('debug', 'Unable to read action logging setting', error);
      return false;
    }
  }

  private detailedLoggingEnabled(): boolean {
    try {
      return this.logger.isDetailedLoggingEnabled();
    } catch (error) {
      this.writeReporterFallback('debug', 'Unable to read detailed logging setting', error);
      return false;
    }
  }

  printsToStdio(): boolean {
    return true;
  }

  onBegin(config: FullConfig): void {
    this.safeLog('info', 'PLAYWRIGHT RUN STARTED', undefined, {
      module: 'Playwright',
      metadata: {
        projects: config.projects.map((project) => project.name),
      },
    });
  }

  onTestBegin(test: TestCase, result: TestResult): void {
    const context = this.testContext(test, result);

    if (result.retry > 0) {
      this.safeLog('warn', `TEST RETRY ${result.retry}/${test.retries}`, undefined, context);
    }

    this.safeLog('info', 'TEST STARTED', undefined, context);
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
    const action = this.actionFromStep(step);

    if (action && this.actionLoggingEnabled()) {
      this.safeLog('debug', 'ACTION STARTED', undefined, {
        ...this.testContext(test, result),
        ...action,
      });
    }

    if (!this.isUserStep(step)) {
      return;
    }

    this.safeLog('info', 'STEP STARTED', undefined, this.testContext(test, result, step));
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    const action = this.actionFromStep(step);

    if (step.error) {
      this.stepFailures.set(
        this.attemptKey(test, result),
        this.failureSummary(test, result, step, action),
      );
    }

    if (action && this.actionLoggingEnabled()) {
      const context = {
        ...this.testContext(test, result),
        ...action,
        durationMs: step.duration,
      };

      if (step.error) {
        const details = this.errorDetails(step.error);
        this.safeLog(
          'error',
          `ACTION FAILED: ${details.message} | Duration: ${this.formatDuration(step.duration)}`,
          details,
          context,
        );
      } else {
        this.safeLog(
          this.detailedLoggingEnabled() ? 'debug' : 'info',
          `ACTION PASSED | Duration: ${this.formatDuration(step.duration)}`,
          undefined,
          context,
        );
      }
    }

    if (!this.isUserStep(step)) {
      return;
    }

    const context = this.testContext(test, result, step);
    const duration = this.formatDuration(step.duration);
    const durationContext = { ...context, durationMs: step.duration };

    if (step.error) {
      const details = this.errorDetails(step.error);
      this.safeLog(
        'error',
        `STEP FAILED: ${details.message} | Duration: ${duration}`,
        details,
        durationContext,
      );
      return;
    }

    this.safeLog('success', `STEP PASSED | Duration: ${duration}`, undefined, durationContext);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const attemptKey = this.attemptKey(test, result);
    const attempt: AttemptRecord = {
      status: result.status,
      duration: result.duration,
      failure:
        result.status === 'passed' || result.status === 'skipped'
          ? undefined
          : (this.stepFailures.get(attemptKey) ??
            this.failureSummary(test, result)),
    };
    this.stepFailures.delete(attemptKey);
    const testAttempts = this.attempts.get(test.id) ?? [];
    testAttempts.push(attempt);
    this.attempts.set(test.id, testAttempts);

    const context = {
      ...this.testContext(test, result),
      durationMs: result.duration,
    };

    if (result.status === 'passed') {
      this.safeLog('success', 'TEST PASSED', undefined, context);
    } else if (result.status === 'skipped') {
      this.safeLog('warn', 'TEST SKIPPED', undefined, context);
    } else {
      const details = this.errorDetails(this.firstError(result.errors), result.status);
      this.safeLog('error', `TEST FAILED: ${details.message}`, details, context);
    }

    this.safeLog(
      'info',
      `TEST FINISHED | Duration: ${this.formatDuration(result.duration)}`,
      undefined,
      context,
    );
  }

  onEnd(result: FullResult): void {
    const summary = this.buildSummary(result);

    for (const failure of summary.failures) {
      const failureContext: LogContext = {
        module: 'Playwright',
        testName: failure.testName,
        testFile: failure.testFile,
        project: failure.project,
        browser: failure.browser,
        worker: failure.worker,
        retry: failure.retry,
        step: failure.step,
        action: failure.action,
        target: failure.target,
        metadata: {
          testId: failure.testId,
          ...(failure.artifacts.length > 0
            ? { artifacts: failure.artifacts }
            : {}),
        },
      };
      this.safeLog(
        'error',
        this.failureMessage(failure),
        { message: failure.message },
        failureContext,
      );
    }

    const summaryMessage =
      `TEST RUN SUMMARY | Total: ${summary.total} | Passed: ${summary.passed} | ` +
      `Failed: ${summary.failed} | Skipped: ${summary.skipped} | ` +
      `Retries: ${summary.retries} | Flaky: ${summary.flaky} | ` +
      `Duration: ${this.formatDuration(summary.durationMs)}`;
    const summaryContext: LogContext = {
      module: 'Playwright',
      metadata: {
        status: result.status,
        total: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        retries: summary.retries,
        flaky: summary.flaky,
      },
      durationMs: summary.durationMs,
    };

    if (summary.failed > 0 || result.status !== 'passed') {
      this.safeLog('error', summaryMessage, undefined, summaryContext);
    } else {
      this.safeLog('success', summaryMessage, undefined, summaryContext);
    }

    this.attempts.clear();
    this.stepFailures.clear();
  }

  private testContext(test: TestCase, result: TestResult, step?: TestStep): LogContext {
    const project = test.parent.project();
    const browserName =
      typeof project?.use.browserName === 'string' ? project.use.browserName : undefined;

    return {
      project: project?.name,
      browser: browserName,
      testName: test.title,
      testFile: test.location?.file,
      testId: test.id,
      worker: result.workerIndex >= 0 ? result.workerIndex : undefined,
      retry: result.retry,
      step: step?.title,
    };
  }

  private isUserStep(step: TestStep): boolean {
    return step.category === 'test.step';
  }

  private actionFromStep(step: TestStep): PlaywrightAction | undefined {
    if (step.category !== 'pw:api') {
      return undefined;
    }

    const match = actionPattern.exec(step.title);

    if (!match) {
      return undefined;
    }

    const [, target, action] = match;

    if (!target || !action) {
      return undefined;
    }

    return {
      action: action.toLowerCase(),
      target: target.toLowerCase(),
    };
  }

  private formatDuration(durationMs: number): string {
    return `${(durationMs / 1_000).toFixed(1)}s`;
  }

  private buildSummary(result: FullResult): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    retries: number;
    flaky: number;
    durationMs: number;
    failures: FailureSummary[];
  } {
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let retries = 0;
    let flaky = 0;
    const failures: FailureSummary[] = [];

    for (const attempts of this.attempts.values()) {
      const finalAttempt = attempts[attempts.length - 1];

      if (!finalAttempt) {
        continue;
      }

      retries += Math.max(0, attempts.length - 1);
      const hadFailure = attempts.some((attempt) => attempt.status === 'failed');

      if (finalAttempt.status === 'passed') {
        passed += 1;
        if (hadFailure) {
          flaky += 1;
        }
      } else if (finalAttempt.status === 'skipped') {
        skipped += 1;
      } else {
        failed += 1;
        if (finalAttempt.failure) {
          failures.push(finalAttempt.failure);
        }
      }
    }

    const durationMs =
      typeof result.duration === 'number'
        ? result.duration
        : [...this.attempts.values()]
            .flat()
            .reduce((total, attempt) => total + attempt.duration, 0);

    return {
      total: this.attempts.size,
      passed,
      failed,
      skipped,
      retries,
      flaky,
      durationMs,
      failures,
    };
  }

  private failureSummary(
    test: TestCase,
    result: TestResult,
    step?: TestStep,
    action?: PlaywrightAction,
  ): FailureSummary {
    const details = this.errorDetails(step?.error ?? this.firstError(result.errors), result.status);

    return {
      testName: test.title,
      testFile: test.location?.file,
      testId: test.id,
      project: test.parent.project()?.name,
      browser:
        typeof test.parent.project()?.use.browserName === 'string'
          ? test.parent.project()?.use.browserName
          : undefined,
      worker: result.workerIndex >= 0 ? result.workerIndex : undefined,
      step: step?.title,
      message: details.message,
      action: action?.action,
      target: action?.target,
      retry: result.retry,
      artifacts: this.artifactPaths(result),
    };
  }

  private failureMessage(failure: FailureSummary): string {
    const details = [
      `TEST FAILURE | Test: ${failure.testName}`,
      failure.step ? `Step: ${failure.step}` : undefined,
      `Error: ${failure.message}`,
      `Retry: ${failure.retry}`,
      failure.artifacts.length > 0 ? `Artifacts: ${failure.artifacts.join(', ')}` : undefined,
    ].filter((value): value is string => value !== undefined);

    return details.join(' | ');
  }

  private artifactPaths(result: TestResult): string[] {
    return (result.attachments ?? [])
      .map((attachment) => attachment.path)
      .filter((path): path is string => typeof path === 'string' && path.length > 0);
  }

  private attemptKey(test: TestCase, result: TestResult): string {
    return [
      test.id,
      test.parent.project()?.name ?? 'unknown-project',
      result.workerIndex,
      result.retry,
    ].join(':');
  }

  private firstError(errors: TestError[]): TestError | undefined {
    return errors.length > 0 ? errors[0] : undefined;
  }

  private errorDetails(
    error: TestError | undefined,
    status?: TestResult['status'],
  ): PlaywrightErrorDetails {
    if (!error) {
      return {
        type: this.statusErrorType(status),
        message: this.statusErrorMessage(status),
      };
    }

    const message = error.message ?? error.value ?? this.statusErrorMessage(status);

    return {
      type: this.errorType(error, status),
      message,
      stack: error.stack,
      snippet: error.snippet,
      location: error.location,
      cause: error.cause ? this.errorDetails(error.cause, status) : undefined,
    };
  }

  private errorType(error: TestError, status?: TestResult['status']): string {
    const firstStackLine = error.stack?.split('\n', 1)[0];
    const stackType = firstStackLine?.match(/^([A-Za-z][\w.]*(?:Error)?):/)?.[1];

    return stackType ?? this.statusErrorType(status);
  }

  private statusErrorType(status?: TestResult['status']): string {
    if (status === 'timedOut') {
      return 'TimeoutError';
    }

    if (status === 'interrupted') {
      return 'InterruptedError';
    }

    return 'Error';
  }

  private statusErrorMessage(status?: TestResult['status']): string {
    if (status === 'timedOut') {
      return 'Test timed out';
    }

    if (status === 'interrupted') {
      return 'Test was interrupted';
    }

    return 'No Playwright error details were available';
  }
}
