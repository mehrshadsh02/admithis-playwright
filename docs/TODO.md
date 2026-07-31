# TODO

## High Priority

- [x] Merge Robot steps 13-20 into the existing `open-admission.spec.ts` workflow.
- [ ] Verify Robot steps 13-20 from WSL 2, Linux Node, or Windows PowerShell.
- [ ] Reset or replace patient `1520554001`; it is already hospitalized and blocks the preadmit save flow.
- [ ] Re-run `npx playwright test tests/admit/open-admission.spec.ts --project=chrome` after data reset.

## Active Inpatient Plan

- [x] Add Robot-derived inpatient patient class, bed, and edit responsible-patient data.
- [x] Add inpatient confirmation and disabled-field locators.
- [x] Add reusable inpatient fill, assignment, save, and edit methods to `AdmissionPage`.
- [x] Remove the duplicate `tests/admit/inpatient-admission.spec.ts` after merging its flow.
- [ ] Run TypeScript, lint, and the targeted open-admission Playwright test.

## Architecture

- [ ] Add modal helper methods when confirmation dialogs repeat.
- [ ] Add spinner helper/component if waits become duplicated across pages.
- [ ] Consider moving `Patient` interfaces into `models/` once more domain models exist.

## Completed

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
