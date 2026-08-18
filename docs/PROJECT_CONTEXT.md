# Project Context

## Goal

Completely migrate the Robot Framework AdmitHis UI tests to Playwright + TypeScript with a maintainable automation architecture.

## Current Status

The repository already had a Playwright scaffold and the first admission spec. Project memory docs now exist and the preadmit migration is implemented through Robot step 12.

Completed or partially completed:

- Robot steps 01-12 are now represented in `tests/admit/open-admission.spec.ts`.
- `AdmissionPage` contains reusable methods for the preadmit filing workflow through save, print-deny, inpatient list navigation, edit, and cancel.
- `CashPage` contains reusable methods for prepayment and refund by national code.
- `NgSelect` component maps Robot's generic ng-select keyword.
- Robot steps 13-20 continue in the existing `tests/admit/open-admission.spec.ts` flow and shared admission layers.

Pending:

- Run automated verification for Robot steps 13-20 from an environment with a working Node runtime.
- A clean or reset patient record is still needed to live-verify the full preadmit create/pay/edit/cancel/refund flow.

## Implemented Migration: Inpatient Steps 13-20

Purpose:

- Create an inpatient admission for the Robot patient.
- Select inpatient-specific patient class and bed data.
- Confirm the admission before denying the print dialog.
- Open the inpatient list, edit the created record, verify protected fields are disabled, change the responsible patient to spouse, and save.

Architecture mapping:

- `data/patient.ts`: contains Robot-derived inpatient patient class, bed, and edit responsible-patient values.
- `locators/AdmissionLocator.ts`: contains the inpatient confirmation control and the fields checked as disabled during edit.
- `pages/AdmissionPage.ts`: reuses common demographic/clinical filling, implements inpatient assignment/save/edit workflows, and keeps disabled-field assertions out of the spec.
- `tests/admit/open-admission.spec.ts`: continues the existing Robot-ordered admission flow through steps 13-20.

Assumptions:

- The inpatient scenario uses the same `${nationalCode}` as the Robot suite.
- The inpatient list is the default list after navigation; the preadmit checkbox must not be selected for step 20.
- A field is considered disabled when Playwright reports it disabled or the application applies a `disabled` CSS class, matching the Robot keyword.
- Live execution depends on the patient being in a state that permits a new inpatient admission.

## Important Decisions

- Preserve existing selectors and Robot-derived data unless verification proves they must change.
- Keep specs short and place workflow details in page objects/components.
- Do not duplicate migrated scenarios. Continue from the first pending Robot step.

## Reusable Utilities

- `components/NgSelect.ts`: select Angular ng-select option by `formcontrolname`.
- `helpers/logger/`: reusable structured console logger configured by `LOG_ENABLED` and `LOG_LEVEL`.
- `pages/BasePage.ts`: navigation and page readiness.
- `pages/CashPage.ts`: cash payment/refund flow by national code.
- `data/patient.ts`: current Robot patient data.

## Logging Phases 1-3

Phase 1 foundation:

- `helpers/logger/` is the centralized logging module.
- Supported levels are `DEBUG`, `INFO`, `SUCCESS`, `WARN`, and `ERROR`.
- Default configuration is logging enabled with `LOG_LEVEL=INFO`, so `DEBUG` stays hidden unless enabled.
- Logs are support-readable, for example `[21:42:15] [INFO] [test name] message`.
- Metadata and error details are sanitized before console output.
- Business specs were not manually instrumented for logging.
- Unit-level logger verification exists in `tests/unit/logger.spec.ts`.

Phase 2 lifecycle integration:

- The existing reporter now logs test start, retry, pass/fail/skip, finish, and duration.
- Reporter step hooks automatically log existing and future explicit `test.step()` blocks.
- Every test/step entry includes test title, project/browser, worker, and retry context when
  available.
- Step errors and test errors include a human-readable message, inferred error type, and
  sanitized stack/location/details when Playwright provides them.
- Only the `test.step` category is logged; internal Playwright steps are filtered out.
- The built-in `list` reporter was removed so the centralized reporter is the single source of
  live lifecycle output. The HTML reporter remains enabled.
- No existing business spec required a logging rewrite.

Configuration remains unchanged:

- `LOG_ENABLED` defaults to enabled; `false`, `0`, `off`, and `no` disable all logger output.
- `LOG_LEVEL` defaults to `INFO` and filters output using the existing Phase 1 level ordering.

Example:

```text
[21:42:15] [INFO] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] TEST STARTED
[21:42:16] [INFO] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] [Validate Emergency Database] STEP STARTED
[21:42:18] [ERROR] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] [Validate Emergency Database] STEP FAILED: Database record did not match | Duration: 2.0s
[21:42:18] [ERROR] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] TEST FAILED: Database record did not match
[21:42:18] [INFO] [chrome / chromium] [002-Create Emergency] [worker 0 | retry 0] TEST FINISHED | Duration: 3.4s
```

Deferred to later phases:

- Manual page-object/action logging.
- Screenshots, traces, external aggregation, and attachments.

Phase 3 structured file logging:

- Phase 3 core implementation and tests are complete.
- `JsonFileLogSink` writes sanitized JSON-lines entries to dated log files.
- Default log directory is `logs/`; the directory is ignored by Git.
- Retention cleanup removes old logger-owned dated files and leaves unrelated files untouched.
- Console and structured output share the same log-level filtering and redaction pipeline.

Phase 3 configuration:

- `LOG_OUTPUT=console`: default support-readable console output only.
- `LOG_OUTPUT=file`: structured file output only.
- `LOG_OUTPUT=both`: console and structured file output.
- `LOG_RETENTION_DAYS=7`: default retention window for dated log files.
- `LOG_RETENTION_DAYS=0`: keep only the current log date.
- Invalid `LOG_OUTPUT` or `LOG_RETENTION_DAYS` values fall back to safe defaults.

Validation:

- Phase 1 validation passed when it was implemented.
- Phase 2 validation passed when it was implemented.
- Phase 3 validation passed before documentation handoff.
- On August 18, 2026, the required logging validation was run from Windows PowerShell using
  Node `v24.17.0`, npm `11.13.0`, and Playwright `1.61.1`.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.
- `npx playwright test tests/unit/logger.spec.ts tests/unit/playwright-logger-reporter.spec.ts --project=chrome`:
  passed for Phase 3.
- Focused Prettier checks for touched logging files passed during logging work.
- A small existing test, `tests/unit/logger.spec.ts -g "logger formats support-readable entries"`,
  passed and emitted live `TEST STARTED`, `TEST PASSED`, and `TEST FINISHED` entries exactly once.
- With `LOG_ENABLED=false`, the same test passed with no logger output.
- With `LOG_LEVEL=ERROR`, the same passing test passed with no INFO/SUCCESS lifecycle output.
- Repository-wide `npm run format:check` has historically failed for pre-existing files outside
  logging scope. No repository-wide formatting rewrite was performed.

## Environment

- Node: `v24.17.0`
- npm: `11.13.0`
- Playwright CLI observed: `1.61.1`
- Configured AdmitHis app URL from `.env`: internal network host `192.168.5.19:8019`.

## Known Limitations

- The updated token is accepted by AdmitHis.
- The migrated preadmit admission flow is blocked by test data state: patient `1520554001` is already hospitalized, so the app shows an alert after save instead of the print-deny modal.
- On 2026-07-26, `npx tsc --noEmit`, `npm run lint`, and the targeted inpatient Playwright test could not start because this shell resolves npm to Windows Node under WSL 1. The error was: `WSL 1 is not supported. Please upgrade to WSL 2 or above. Could not determine Node.js install directory`.
- Some files are placeholders and should be filled only when needed.
- Persian strings appear mojibaked in source files; keep them stable for now because they came from the existing Robot suite.
- Explicit business step logs depend on `test.step()` usage; the reporter intentionally does not
  turn every Playwright API call into a support log line.
- Screenshots and traces remain disabled and are not part of Phase 3.
- Historical WSL 1/Windows Node failures remain documented in the session history; current Phase
  logging validation was completed successfully from Windows PowerShell.

## Next Recommended Step

Ready to start Phase 4 when explicitly requested: SafeActions and WaitEngine logging integration.
Do not begin Phase 4 until the user asks for it.
