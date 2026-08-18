# TODO

## High Priority

- [x] Implement Phase 1 centralized reusable logger.
- [x] Implement Phase 2 Playwright lifecycle and explicit `test.step()` logging.
- [x] Implement Phase 3 structured JSON file logging.
- [x] Merge Robot steps 13-20 into the existing `open-admission.spec.ts` workflow.
- [ ] Verify Robot steps 13-20 from WSL 2, Linux Node, or Windows PowerShell.
- [ ] Reset or replace patient `1520554001`; it is already hospitalized and blocks the preadmit save flow.
- [ ] Re-run `npx playwright test tests/admit/open-admission.spec.ts --project=chrome` after data reset.
- [x] Run the Phase 2 TypeScript, lint, focused formatter, logger/reporter, and live logging
      validations from Windows PowerShell.
- [x] Phase 1: Popup and Dialog Management (`page.addInitScript`)
- [x] Phase 2: Core Logger Infrastructure (`helpers/logger/`)
- [x] Phase 3: Custom Reporter & NDJSON Sinks
- [/] Phase 4: Integrate Logger into `BasePage` (SafeActions & WaitEngine)
  - [x] Document Phase 4 Architecture & Contracts
  - [ ] Refactor `BasePage.ts` with contextual logging
  - [ ] Type check and lint validation
- [ ] Phase 5: Page Objects Refactor (`AdmissionPage`, `CashPage`, `CartablePage`)    

## Active Inpatient Plan

- [x] Add Robot-derived inpatient patient class, bed, and edit responsible-patient data.
- [x] Add inpatient confirmation and disabled-field locators.
- [x] Add reusable inpatient fill, assignment, save, and edit methods to `AdmissionPage`.
- [x] Remove the duplicate `tests/admit/inpatient-admission.spec.ts` after merging its flow.
- [ ] Run TypeScript, lint, and the targeted open-admission Playwright test.

## Architecture

- [x] Extend the Phase 1 reporter for zero-rewrite lifecycle and `test.step()` logging.
- [x] Add structured JSON-lines file sink and retention configuration.
- [ ] Scope Phase 4 separately before adding SafeActions or WaitEngine logging integration.
- [ ] Keep screenshots, traces, attachments, and external aggregation out of logging until
      explicitly requested.
- [ ] Add modal helper methods when confirmation dialogs repeat.
- [ ] Add spinner helper/component if waits become duplicated across pages.
- [ ] Consider moving `Patient` interfaces into `models/` once more domain models exist.

## Completed

- [x] Added `helpers/logger/` with levels, env config, formatting, sanitization, and Error handling.
- [x] Added Playwright reporter integration for framework-level logging.
- [x] Added automatic test start/retry/status/finish/duration logging with project/browser,
      worker, and retry context.
- [x] Added automatic logging for existing explicit `test.step()` blocks while filtering
      internal Playwright steps.
- [x] Added `JsonFileLogSink` for structured JSON file output.
- [x] Added `LOG_OUTPUT` and `LOG_RETENTION_DAYS` configuration.
- [x] Added retention cleanup for logger-owned dated files.
- [x] Added `logs/` to `.gitignore`.
- [x] Removed the built-in `list` reporter to prevent duplicate live lifecycle logs.
- [x] Added `tests/unit/playwright-logger-reporter.spec.ts`.
- [x] Added `tests/unit/logger.spec.ts`.
- [x] Added `README.md` with source-of-truth, docs, state, and verification entry points.
- [x] Created project memory documentation.
- [x] Added reusable `NgSelect` component.
- [x] Migrated preadmit steps 04-06 into the existing admission spec.
- [x] Migrated preadmit steps 07-12 into the existing admission spec.
- [x] Added `CashPage` and `CashLocator`.

## Discovered Problems

- Updated token works; current admission failure is now patient data state, not authentication.
- Patient `1520554001` is already hospitalized, so the app shows an alert after save and no print-deny modal appears.
- Validation commands cannot start in the current shell because npm resolves to Windows Node under WSL 1: `WSL 1 is not supported. Please upgrade to WSL 2 or above. Could not determine Node.js install directory`.
- Repository-wide Prettier validation still reports 31 pre-existing files outside Phase 2; the
  focused Phase 2 formatter check passes.
