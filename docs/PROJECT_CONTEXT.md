# Project Context

## Project goal

Provide maintainable AdmitHis UI automation with Playwright + TypeScript, using page objects, reusable components, typed data, fixtures, and supporting API/DB validation where required.

## Current status

- **Robot UI migration: COMPLETED.** Robot is legacy/historical reference only.
- **Current direction: Playwright-native development.**
- Repository areas include preadmit, inpatient, emergency, smoke, authentication placeholder, and unit tests.

## Current architecture

Business specs in `tests/` use shared `fixtures/test.ts`. Workflows live in `pages/`; controls in `components/`; selectors in `locators/`; typed scenario data in `data/`; domain types in `models/`; logging/network utilities in `helpers/`; environment/routes/constants in `config/`; and optional integration support in `Api/` and `DB/`. `robot/` is read-only historical material.

## Implemented capabilities

- Admission page workflows for patient search, preadmit, inpatient, and emergency paths.
- Cash payment/refund and cartable/list workflows.
- Reusable ng-select, modal, spinner, toast, date-picker, and base abstractions.
- Shared fixture with network logger attachment.
- Central logger with levels, redaction, console/file/both output, JSON-lines sink, retention, lifecycle/step/action reporting, and artifact-mode configuration.
- HTML, Allure, and Monocart reporters.
- API client/patient API and SQL database/query/validator support.

## Testing and verification status

**Verified in recorded history:** TypeScript, ESLint, focused logger/reporter/network unit tests, and selected smoke/logging checks from Windows PowerShell. **Implemented but not fully live-verified:** complete admission flows; live validation depends on internal host reachability and suitable patient state.

## Constraints and known limitations

- Never expose credentials, tokens, cookies, headers, or database secrets.
- Internal access and mutable patient data are prerequisites for E2E verification.
- Existing mojibake Persian strings are preserved for compatibility.
- Historical WSL 1/Windows Node startup failures remain in session history.

## Current TODO

See `docs/TODO.md`: keep native coverage healthy, rerun live flows when environment/data are available, and address listed technical debt without reopening migration.

## Rules for future developers and AI agents

Use actual source as truth, classify work as Implemented or Verified, label all new work **New Playwright-native development**, and update docs after meaningful changes.
