# Changelog

## Phase 1 — Robot UI → Playwright Migration

**Status: COMPLETED**

- Transferred documented Robot UI scenarios, including preadmit steps 01–12 and inpatient steps 13–20, into Playwright + TypeScript.
- Added page objects, locator classes, reusable components, typed data, fixtures, and supporting cash/emergency flows.
- Preserved Robot files as historical reference.
- Recorded implementation and targeted verification separately; full live admission verification remains environment/data dependent.

## Phase 2 — Playwright-native Development

**Status: CURRENT**

- Added centralized logging, redaction, lifecycle/step/action reporting, JSON-lines output, retention, and network failure logging.
- Configured HTML, Allure, and Monocart reporting.
- Added SafeActions/WaitEngine behavior to `BasePage`, shared fixtures, and supporting API/DB layers.
- Continued unit, smoke, and architecture improvements directly in Playwright; these are not migration work.

See `docs/SESSION_LOG.md` and `docs/PROJECT_CONTEXT.md` for dates and verification outcomes.
