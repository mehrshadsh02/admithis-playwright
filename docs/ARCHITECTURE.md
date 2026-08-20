# Architecture

## Overview

The project is a Playwright + TypeScript end-to-end test suite for AdmitHis UI workflows. It is being migrated from Robot Framework while improving maintainability.

## Folder Structure

- `tests/`: Playwright specs. Specs should read as business flows and delegate details to page objects.
- `pages/`: page objects and workflow methods.
- `locators/`: locator classes used by page objects.
- `components/`: reusable UI components.
- `data/`: typed test data translated from Robot variables.
- `fixtures/`: reserved for shared Playwright fixtures. Lifecycle logging does not require a
  fixture because the reporter can observe existing tests without changing their imports.
- `config/`: shared constants and environment/routing placeholders.
- `robot/`: source Robot Framework tests and resources.

## Page Objects

`pages/AdmissionPage.ts` is the primary active page object. It currently supports:

- opening the admission filing page
- selecting Iranian nationality
- entering and inquiring national code
- filling patient demographic, companion, and clinical information
- assigning ward, doctor, responsible patient, and prepayment
- saving an admission filing
- denying the print page modal
- opening the inpatient list
- loading the preadmit list
- editing a preadmit patient's ward/doctor
- canceling a preadmit patient

The inpatient extension supports:

- shared demographic and companion form filling for both admission types
- inpatient patient-class and clinical-data filling
- ward, bed, doctor, and responsible-patient assignment
- inpatient save confirmation
- inpatient edit lookup and protected-field assertions
- responsible-patient change during inpatient edit

`pages/BasePage.ts` provides navigation, page readiness, and URL verification.

`pages/CashPage.ts` supports cash search, prepayment, and refund flows by national code.

## Components

`components/NgSelect.ts` centralizes Angular `ng-select` interaction by `formcontrolname`. This maps Robot's `Select From Ng Select` keyword.

Other component files exist as placeholders:

- `Modal.ts`
- `Spinner.ts`
- `Toast.ts`
- `DatePicker.ts`

Use these before adding repeated modal/spinner/toast/date logic to pages.

## Locators

Locator classes should contain selectors only. Page objects should own behavior.

`locators/AdmissionLocator.ts` contains active admission filing selectors.

`locators/CashLocator.ts` contains active Cash app selectors.

## Helpers

`helpers/logger/` contains the reusable logging foundation.

Phase 1 responsibilities:

- provide one centralized logger API: `debug`, `info`, `warn`, `error`, and `success`
- format support-readable console messages with timestamp, level, optional test name, optional project/module, optional step, and sanitized metadata
- read configuration from `LOG_ENABLED` and `LOG_LEVEL`
- redact sensitive values such as tokens, passwords, cookies, authorization headers, and secret-like keys before output
- work independently of Playwright test files so it can be reused by other test projects

Phase 2 extends the existing Playwright reporter instead of replacing the Phase 1 logger or
requiring a custom test import.

Phase 2 reporter responsibilities:

- log each test start, retry, status, finish, and duration automatically
- add test title, Playwright project/browser, worker index, and retry index to test and step logs
- observe reporter `onStepBegin` and `onStepEnd` events for the `test.step` category
- log step start, pass/failure, duration, and useful sanitized error details
- ignore internal `pw:api`, fixture, hook, attachment, and assertion steps to keep support output
  concise
- remain the only live terminal lifecycle reporter; the built-in `list` reporter was removed to
  avoid duplicate lifecycle output
- keep the HTML reporter for the existing post-run report

The reporter was selected instead of a fixture because current specs import directly from
`@playwright/test`, the shared fixture is empty, and reporter hooks cover existing and future
tests without rewriting imports or adding logging calls to business scenarios.

Phase 3 adds structured file logging on top of the existing console logger and reporter.

Phase 3 structured logging responsibilities:

- support `LOG_OUTPUT=console`, `LOG_OUTPUT=file`, and `LOG_OUTPUT=both`
- write sanitized JSON-lines log entries to dated files under `logs/`
- preserve the support-readable console format when console output is enabled
- keep console and file output behind the same `LOG_ENABLED` and `LOG_LEVEL` filtering
- apply the same centralized redaction rules to both console lines and structured entries
- retain recent dated log files and delete old dated log files through `LOG_RETENTION_DAYS`

`JsonFileLogSink` owns file output. It writes one JSON object per line to
`logs/test-YYYY-MM-DD.log`, creates the log directory as needed, and performs retention cleanup
once per log date. Cleanup only targets files matching the logger-owned `test-YYYY-MM-DD.log`
pattern so unrelated files in the directory are left alone.

Files:

- `helpers/logger/types.ts`: shared logger types.
- `helpers/logger/config.ts`: environment parsing and defaults.
- `helpers/logger/sanitize.ts`: metadata/error redaction.
- `helpers/logger/Logger.ts`: logger implementation and console sink.
- `helpers/logger/index.ts`: public exports and default logger instance.
- `helpers/logger/PlaywrightLoggerReporter.ts`: framework-level Playwright lifecycle and
  `test.step` integration.
- `helpers/logger/JsonFileLogSink.ts`: structured JSON-lines file sink and retention cleanup.

Configuration:

- `LOG_ENABLED`: defaults to enabled. Set to `false`, `0`, `off`, or `no` to disable output.
- `LOG_LEVEL`: defaults to `INFO`. Supported values are `DEBUG`, `INFO`, `SUCCESS`, `WARN`, and `ERROR`.
- `LOG_OUTPUT`: defaults to `console`. Supported values are `console`, `file`, and `both`.
- `LOG_RETENTION_DAYS`: defaults to `7`. Set to a non-negative integer; invalid values fall back
  to `7`.

Example:

```ts
import { logger } from '../helpers/logger';

logger.info('Searching patient', { testName: '002-Create Emergency' });
logger.success('Patient found', { testName: '002-Create Emergency' });
logger.error('Database validation failed', error, {
  testName: '002-Create Emergency',
});
```

Automatic terminal example:

```text
[21:42:15] [INFO] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] TEST STARTED
[21:42:16] [INFO] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] [Validate database] STEP STARTED
[21:42:18] [SUCCESS] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] [Validate database] STEP PASSED | Duration: 2.0s
[21:42:28] [SUCCESS] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] TEST PASSED
[21:42:28] [INFO] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] TEST FINISHED | Duration: 12.4s
```

Known Phase 2 limitations:

- Only explicit `test.step()` blocks receive business step names. Page-object calls outside a
  `test.step()` remain covered by test lifecycle logs but are not inferred as steps.
- Parallel workers can interleave complete log lines; worker and retry context identify the
  source.
- Failure details are terminal text only. Screenshots, traces, file/JSON sinks, and attachments
  are intentionally not implemented in Phase 2.

Phase 3 limitations:

- Log files are local JSON-lines artifacts only; no external log aggregation is implemented.
- Screenshots, traces, attachments, and page/action-level logging remain outside Phase 3.
- The `logs/` directory is ignored by Git and should not be committed.

Security rules:

- Do not log raw tokens, passwords, cookies, authorization headers, API keys, or session values.
- Put operational details in `metadata`; the logger sanitizes sensitive keys and common secret string patterns.
- Future phases must keep redaction centralized instead of adding ad hoc masking in tests.
- Structured file output must go through `Logger`/`JsonFileLogSink` so file logs receive the same
  sanitization as console logs.

## Data Flow

Robot variables are translated into typed TypeScript data in `data/patient.ts`.

Tests import stable data and pass it to page methods. Page methods choose the controls and sequence.

The inpatient workflow extends the existing patient model rather than creating duplicate scenario data because Robot steps 13-20 reuse the same patient and most of the same form values.

## Naming Conventions

- Page objects: `XPage`
- Locator classes: `XLocator`
- Components: UI control name, for example `NgSelect`
- Specs: business flow, for example `open-admission.spec.ts`
- Test names: user-visible workflow names, not implementation details

## Architectural Decisions

- Robot keyword `Select From Ng Select` is implemented once in `NgSelect`.
- The first migrated spec remains in `tests/admit/open-admission.spec.ts` and is extended rather than duplicated.
- The inpatient Robot block continues the existing `tests/admit/open-admission.spec.ts` sequence after preadmit cancellation and refund.
- Logging Phase 2 uses reporter hooks for zero-rewrite lifecycle and explicit `test.step`
  coverage. Manual page/action logging and failure artifacts remain deferred.
- Logging Phase 3 adds structured JSON-lines file output and retention without changing business
  tests or page objects.
- Mojibake Persian text from Robot is preserved as-is for selector/data compatibility until encoding is intentionally corrected across the project.

## Phase 4: SafeActions & WaitEngine Integration with Centralized Logger

### Objectives

- Integrate Playwright UI interactions (`safeClick`, `safeFill`, `safeClickCartable`, `fillIfEmpty`) with `logger`.
- Enhance `WaitEngine` (`waitUntilStable`, `waitForPageReady`) to trace Angular spinner `.back-spenner` state changes.
- Provide contextual action descriptions for detailed test execution traces.

### Final contracts

`pages/BasePage.ts` is the compatibility boundary for safe page actions. The implementation
must preserve its public method names and existing callers while applying these contracts:

- `waitForPageReady` waits for `domcontentloaded`, then waits for the `.back-spenner`
  spinner to be hidden through `waitUntilStable`.
- `waitUntilStable(timeout)` waits for `.back-spenner` with a configurable timeout. A
  missing spinner, a detached spinner, or a timeout is a non-fatal condition; the outcome is
  recorded through the centralized logger.
- `safeClick` waits for stability, scrolls to the locator, verifies visibility and enabled
  state, clicks, waits for post-click stability, and logs both success and failure. Error
  details must pass through the logger sanitization pipeline.
- `safeFill` follows the same pre/post stability and scroll contract, verifies visibility,
  fills the value, and logs only the contextual description—not the actual value.
- `safeClickCartable` verifies attached, visible, and enabled state; attempts scrolling with
  container errors handled as warnings; uses an independent click timeout; and logs success
  or failure.
- `fillIfEmpty` reads the current input value, skips a non-empty field, and fills only an
  empty field. Neither the existing nor the new sensitive value may be written to logs.

All action descriptions are caller-provided context and must remain free of patient data,
passwords, tokens, and other secrets.
