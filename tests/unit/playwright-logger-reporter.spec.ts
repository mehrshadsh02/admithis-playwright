import { expect, test } from '@playwright/test';
import type {
  FullProject,
  FullResult,
  TestCase,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';
import { Logger } from '../../helpers/logger';
import type { LogLevel, LoggerSink } from '../../helpers/logger';
import PlaywrightLoggerReporter from '../../helpers/logger/PlaywrightLoggerReporter';

class MemorySink implements LoggerSink {
  readonly lines: string[] = [];

  write(_level: LogLevel, line: string): void {
    this.lines.push(line);
  }
}

function createReporter(): { reporter: PlaywrightLoggerReporter; sink: MemorySink } {
  const sink = new MemorySink();
  const logger = new Logger({
    config: { enabled: true, level: 'DEBUG' },
    sink,
    now: () => new Date(2026, 7, 18, 21, 42, 15),
  });

  return {
    reporter: new PlaywrightLoggerReporter({ logger }),
    sink,
  };
}

function createTestCase(retries = 2, overrides: Partial<TestCase> = {}): TestCase {
  const project = {
    name: 'chrome',
    use: {
      browserName: 'chromium',
    },
  } as unknown as FullProject;

  return {
    title: '002-Create Emergency',
    id: 'test-002',
    retries,
    parent: {
      project: () => project,
    },
    ...overrides,
  } as unknown as TestCase;
}

function createResult(overrides: Partial<TestResult> = {}): TestResult {
  return {
    retry: 0,
    workerIndex: 3,
    duration: 12_400,
    status: 'passed',
    errors: [],
    ...overrides,
  } as unknown as TestResult;
}

function createStep(overrides: Partial<TestStep> = {}): TestStep {
  return {
    title: 'Validate database',
    category: 'test.step',
    duration: 850,
    ...overrides,
  } as unknown as TestStep;
}

test('reporter logs test lifecycle with execution context and duration', async () => {
  await test.step('Simulate passing lifecycle', async () => {
    const { reporter, sink } = createReporter();
    const testCase = createTestCase();
    const result = createResult();

    reporter.onTestBegin(testCase, result);
    reporter.onTestEnd(testCase, result);

    expect(sink.lines).toEqual([
      '[21:42:15] [INFO] [chrome / chromium] [002-Create Emergency] [worker 3 | retry 0] TEST STARTED',
      '[21:42:15] [SUCCESS] [chrome / chromium] [002-Create Emergency] [worker 3 | retry 0] TEST PASSED',
      '[21:42:15] [INFO] [chrome / chromium] [002-Create Emergency] [worker 3 | retry 0] TEST FINISHED | Duration: 12.4s',
    ]);
  });
});

test('reporter logs retries, skips, and user-authored steps only', () => {
  const { reporter, sink } = createReporter();
  const testCase = createTestCase();
  const retryResult = createResult({ retry: 1 });
  const skippedResult = createResult({ status: 'skipped', duration: 0 });

  reporter.onTestBegin(testCase, retryResult);
  reporter.onStepBegin(testCase, retryResult, createStep());
  reporter.onStepEnd(testCase, retryResult, createStep());
  reporter.onStepBegin(testCase, retryResult, createStep({ category: 'pw:api' }));
  reporter.onTestEnd(testCase, skippedResult);

  expect(sink.lines).toContain(
    '[21:42:15] [WARN] [chrome / chromium] [002-Create Emergency] [worker 3 | retry 1] TEST RETRY 1/2',
  );
  expect(sink.lines).toContain(
    '[21:42:15] [INFO] [chrome / chromium] [002-Create Emergency] [worker 3 | retry 1] [Validate database] STEP STARTED',
  );
  expect(sink.lines).toContain(
    '[21:42:15] [SUCCESS] [chrome / chromium] [002-Create Emergency] [worker 3 | retry 1] [Validate database] STEP PASSED | Duration: 0.8s',
  );
  expect(sink.lines).toContain(
    '[21:42:15] [WARN] [chrome / chromium] [002-Create Emergency] [worker 3 | retry 0] TEST SKIPPED',
  );
  expect(sink.lines.filter((line) => line.includes('STEP STARTED'))).toHaveLength(1);
});

test('reporter logs human-readable step and test failure details', () => {
  const { reporter, sink } = createReporter();
  const testCase = createTestCase();
  const error = {
    message: 'Database record did not match',
    stack: 'AssertionError: Database record did not match\n    at validator.ts:42:3',
    location: {
      file: 'validator.ts',
      line: 42,
      column: 3,
    },
  };
  const result = createResult({
    status: 'failed',
    errors: [error],
  });
  const step = createStep({ error });

  reporter.onStepEnd(testCase, result, step);
  reporter.onTestEnd(testCase, result);

  expect(sink.lines[0]).toContain('STEP FAILED: Database record did not match');
  expect(sink.lines[0]).toContain('"type":"AssertionError"');
  expect(sink.lines[0]).toContain('"stack":"AssertionError: Database record did not match');
  expect(sink.lines[1]).toContain('TEST FAILED: Database record did not match');
  expect(sink.lines[1]).toContain('"file":"validator.ts"');
});

test('reporter logs Playwright actions with context and duration', () => {
  const { reporter, sink } = createReporter();
  const testCase = createTestCase();
  const result = createResult();
  const action = createStep({
    title: 'locator.click',
    category: 'pw:api',
    duration: 125,
  });

  reporter.onStepBegin(testCase, result, action);
  reporter.onStepEnd(testCase, result, action);

  expect(sink.lines).toEqual([
    '[21:42:15] [DEBUG] [chrome / chromium] [002-Create Emergency] [worker 3 | retry 0] [action=click target=locator] ACTION STARTED',
    '[21:42:15] [DEBUG] [chrome / chromium] [002-Create Emergency] [worker 3 | retry 0] [action=click target=locator] ACTION PASSED | Duration: 0.1s',
  ]);
});

test('reporter logs action failures without exposing action arguments', () => {
  const { reporter, sink } = createReporter();
  const testCase = createTestCase();
  const result = createResult();
  const action = createStep({
    title: 'locator.fill',
    category: 'pw:api',
    duration: 250,
    error: {
      message: 'fill failed password=plain-text',
      stack: 'Error: fill failed password=plain-text',
    },
  });

  reporter.onStepEnd(testCase, result, action);

  expect(sink.lines[0]).toContain('ACTION FAILED: fill failed password=[REDACTED]');
  expect(sink.lines[0]).toContain('[action=fill target=locator]');
  expect(sink.lines[0]).not.toContain('plain-text');
});

test('reporter emits one readable end-of-run summary with retry and flaky counts', () => {
  const { reporter, sink } = createReporter();
  const passed = createTestCase(0, { id: 'passed-test', title: 'Passed test' });
  const flaky = createTestCase(1, { id: 'flaky-test', title: 'Flaky test' });
  const failed = createTestCase(0, { id: 'failed-test', title: 'Failed test' });
  const skipped = createTestCase(0, { id: 'skipped-test', title: 'Skipped test' });

  reporter.onTestEnd(passed, createResult({ duration: 100, status: 'passed' }));
  reporter.onTestEnd(
    flaky,
    createResult({ duration: 200, status: 'failed', retry: 0, errors: [{ message: 'transient' }] }),
  );
  reporter.onTestEnd(
    flaky,
    createResult({ duration: 300, status: 'passed', retry: 1, errors: [] }),
  );
  reporter.onTestEnd(
    failed,
    createResult({ duration: 400, status: 'failed', errors: [{ message: 'assertion failed' }] }),
  );
  reporter.onTestEnd(skipped, createResult({ duration: 0, status: 'skipped' }));

  reporter.onEnd({
    status: 'failed',
    duration: 1_000,
  } as FullResult);

  expect(sink.lines.filter((line) => line.includes('TEST RUN SUMMARY'))).toEqual([
    '[21:42:15] [ERROR] [Playwright] TEST RUN SUMMARY | Total: 4 | Passed: 2 | Failed: 1 | Skipped: 1 | Retries: 1 | Flaky: 1 | Duration: 1.0s | metadata={"status":"failed","total":4,"passed":2,"failed":1,"skipped":1,"retries":1,"flaky":1}',
  ]);
  expect(sink.lines.filter((line) => line.includes('TEST FAILURE'))).toHaveLength(1);
  expect(sink.lines.some((line) => line.includes('assertion failed'))).toBe(true);
});

test('reporter includes failed step action context and artifact paths', () => {
  const { reporter, sink } = createReporter();
  const testCase = createTestCase(0, { id: 'artifact-test', title: 'Artifact test' });
  const result = createResult({
    status: 'failed',
    retry: 2,
    errors: [{ message: 'click failed' }],
    attachments: [
      { name: 'trace', path: 'test-results/trace.zip', contentType: 'application/zip' },
    ],
  });
  const step = createStep({
    title: 'locator.click',
    category: 'pw:api',
    error: { message: 'click failed' },
  });

  reporter.onStepEnd(testCase, result, step);
  reporter.onTestEnd(testCase, result);
  reporter.onEnd({ status: 'failed', duration: 700 } as FullResult);

  const failure = sink.lines.find((line) => line.includes('TEST FAILURE'));
  expect(failure).toContain('Test: Artifact test');
  expect(failure).toContain('Error: click failed');
  expect(failure).toContain('Retry: 2');
  expect(failure).toContain('Artifacts: test-results/trace.zip');
  expect(failure).toContain('[action=click target=locator]');
});

test('reporter isolates logger failures from the test lifecycle', () => {
  const throwingLogger = {
    info: () => {
      throw new Error('logger unavailable');
    },
    warn: () => {
      throw new Error('logger unavailable');
    },
    error: () => {
      throw new Error('logger unavailable');
    },
    success: () => {
      throw new Error('logger unavailable');
    },
    debug: () => {
      throw new Error('logger unavailable');
    },
    isActionLoggingEnabled: () => {
      throw new Error('logger unavailable');
    },
    isDetailedLoggingEnabled: () => {
      throw new Error('logger unavailable');
    },
  } as unknown as Logger;
  const reporter = new PlaywrightLoggerReporter({ logger: throwingLogger });

  expect(() => {
    const testCase = createTestCase();
    const result = createResult();
    reporter.onTestBegin(testCase, result);
    reporter.onStepBegin(testCase, result, createStep());
    reporter.onStepEnd(testCase, result, createStep());
    reporter.onTestEnd(testCase, result);
    reporter.onEnd({ status: 'failed', duration: 10 } as FullResult);
  }).not.toThrow();
});
