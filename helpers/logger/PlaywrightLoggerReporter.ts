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

export default class PlaywrightLoggerReporter implements Reporter {
  private readonly logger: Logger;

  constructor(options: PlaywrightLoggerReporterOptions = {}) {
    this.logger = options.logger ?? defaultLogger;
  }

  printsToStdio(): boolean {
    return true;
  }

  onBegin(config: FullConfig): void {
    this.logger.info('PLAYWRIGHT RUN STARTED', {
      module: 'Playwright',
      metadata: {
        projects: config.projects.map((project) => project.name),
      },
    });
  }

  onTestBegin(test: TestCase, result: TestResult): void {
    const context = this.testContext(test, result);

    if (result.retry > 0) {
      this.logger.warn(`TEST RETRY ${result.retry}/${test.retries}`, context);
    }

    this.logger.info('TEST STARTED', context);
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
    if (!this.isUserStep(step)) {
      return;
    }

    this.logger.info('STEP STARTED', this.testContext(test, result, step));
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    if (!this.isUserStep(step)) {
      return;
    }

    const context = this.testContext(test, result, step);
    const duration = this.formatDuration(step.duration);
    const durationContext = { ...context, durationMs: step.duration };

    if (step.error) {
      const details = this.errorDetails(step.error);
      this.logger.error(
        `STEP FAILED: ${details.message} | Duration: ${duration}`,
        details,
        durationContext,
      );
      return;
    }

    this.logger.success(`STEP PASSED | Duration: ${duration}`, durationContext);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const context = {
      ...this.testContext(test, result),
      durationMs: result.duration,
    };

    if (result.status === 'passed') {
      this.logger.success('TEST PASSED', context);
    } else if (result.status === 'skipped') {
      this.logger.warn('TEST SKIPPED', context);
    } else {
      const details = this.errorDetails(this.firstError(result.errors), result.status);
      this.logger.error(`TEST FAILED: ${details.message}`, details, context);
    }

    this.logger.info(`TEST FINISHED | Duration: ${this.formatDuration(result.duration)}`, context);
  }

  onEnd(result: FullResult): void {
    if (result.status === 'passed') {
      this.logger.success('PLAYWRIGHT RUN FINISHED', {
        module: 'Playwright',
        metadata: { status: result.status },
      });
      return;
    }

    this.logger.error('PLAYWRIGHT RUN FINISHED WITH FAILURES', {
      module: 'Playwright',
      metadata: { status: result.status },
    });
  }

  private testContext(test: TestCase, result: TestResult, step?: TestStep): LogContext {
    const project = test.parent.project();
    const browserName =
      typeof project?.use.browserName === 'string' ? project.use.browserName : undefined;

    return {
      project: project?.name,
      browser: browserName,
      testName: test.title,
      worker: result.workerIndex >= 0 ? result.workerIndex : undefined,
      retry: result.retry,
      step: step?.title,
    };
  }

  private isUserStep(step: TestStep): boolean {
    return step.category === 'test.step';
  }

  private formatDuration(durationMs: number): string {
    return `${(durationMs / 1_000).toFixed(1)}s`;
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
