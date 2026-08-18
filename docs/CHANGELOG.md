# Changelog

## 2026-08-18

- Completed logging Phase 3 structured file logging.
- Added `JsonFileLogSink` for sanitized JSON-lines output to dated log files.
- Added `LOG_OUTPUT` support for `console`, `file`, and `both`.
- Added `LOG_RETENTION_DAYS` support for local log retention cleanup.
- Added `logs/` to `.gitignore`.
- Verified Phase 3 logger/reporter tests remain passing.
- Validated Phase 2 from Windows PowerShell: TypeScript, ESLint, focused Prettier, and 9 logger/
  reporter tests passed.
- Confirmed live lifecycle and `test.step()` output with an existing test.
- Confirmed `LOG_ENABLED=false` suppresses logger output and `LOG_LEVEL=ERROR` filters passing
  INFO/SUCCESS lifecycle entries.
- Confirmed no duplicate lifecycle output from the configured reporters.
- Formatted only four Phase 2-touched files identified by the focused formatter check.
- Recorded repository-wide Prettier failure for 31 pre-existing files outside Phase 2.
- Implemented logging Phase 2 by extending the existing centralized Playwright reporter.
- Added automatic test start, retry, pass/fail/skip, finish, and duration logs.
- Added automatic `test.step()` start/pass/failure/duration logs without changing business
  specs.
- Added project/browser, worker, and retry context to lifecycle and step entries.
- Added structured human-readable Playwright error details with centralized sanitization.
- Removed the built-in `list` reporter to prevent duplicate live lifecycle output; retained the
  HTML reporter.
- Added focused reporter tests plus explicit disabled-logger coverage.
- Kept screenshots, traces, attachments, file sinks, and page-action logging out of Phase 2.
- Planned Phase 1 centralized logging foundation in docs before implementation.
- Added reusable logger core under `helpers/logger/` with level filtering, environment configuration, support-readable formatting, metadata/error handling, and secret redaction.
- Added framework-level Playwright reporter integration without manually instrumenting business tests.
- Added unit-level logger verification in `tests/unit/logger.spec.ts`.
- Removed two unused imports that blocked TypeScript/lint validation without changing test behavior.

## 2026-07-26

- Migrated Robot inpatient steps 13-20 into the existing `tests/admit/open-admission.spec.ts` sequence.
- Extended patient data with inpatient class, bed, and edit responsible-patient values.
- Extended admission locators for confirmation and protected inpatient edit fields.
- Refactored shared patient information filling and added inpatient assignment, save, disabled-field verification, and edit workflows to `AdmissionPage`.
- Removed the duplicate inpatient spec path.
- Recorded the WSL 1/Windows Node validation blocker.

## 2026-07-21

- Created permanent project memory documentation.
- Added reusable `NgSelect` component for Robot `Select From Ng Select` migration.
- Extended admission locators and page object to cover preadmit companion info, clinical info, ward/doctor/prepayment assignment, save, and print-deny.
- Added Cash page/locator workflows for payment and refund by national code.
- Updated `tests/admit/open-admission.spec.ts` to continue the preadmit flow through Robot step 12.
- Fixed the smoke test to open the configured AdmitHis filing URL instead of expecting the Landing app URL.
