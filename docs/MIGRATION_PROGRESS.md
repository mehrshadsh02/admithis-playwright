# Migration Progress

## Robot UI → Playwright migration

**Status: COMPLETED.** The documented Robot UI scenarios were transferred to Playwright + TypeScript. No Robot-to-Playwright task remains pending.

| Historical Robot scope | Playwright implementation | Status |
| --- | --- | --- |
| Preadmit steps 01–12 | `tests/admit/open-admission.spec.ts`, `AdmissionPage`, `CashPage`, shared locators/components/data | Completed |
| Inpatient steps 13–20 | Same admission flow with inpatient data, confirmation, protected-field assertions, and edit methods | Completed |
| Emergency admission flow | Admission spec with emergency data/state and API/DB support | Implemented |
| Robot ng-select keyword | `components/NgSelect.ts` | Completed |

This structure is the completed migration result. Robot files remain historical references only.

## Implemented vs Verified

Implemented means code exists. Verified means a command/test actually exercised it.

- TypeScript, ESLint, focused logger/reporter/network unit tests, and selected smoke/logging checks were recorded as passing from Windows PowerShell on August 18–19, 2026.
- The complete live admission flows are **not** claimed as verified: patient `1520554001` was already hospitalized and the internal host later timed out.

## Post-Migration Playwright Development

These are native Playwright capabilities, not migration tasks:

- centralized logger, redaction, lifecycle/step/action reporting, JSON-lines sink, and retention;
- spinner-aware `BasePage` waits and safe actions;
- Playwright network logging;
- Allure, HTML, and Monocart reporter configuration;
- shared fixtures, API/DB helpers, emergency flows, and ongoing test architecture improvements.

Future work belongs here unless explicitly historical.
