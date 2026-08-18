import { expect, test } from '@playwright/test';
import type { FullProject, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
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

function createTestCase(retries = 2): TestCase {
  const project = {
    name: 'chrome',
    use: {
      browserName: 'chromium',
    },
  } as unknown as FullProject;

  return {
    title: '002-Create Emergency',
    retries,
    parent: {
      project: () => project,
    },
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
