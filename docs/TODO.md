# TODO

## High Priority

- [ ] Implement Robot steps 13-20: inpatient admission and edit workflow.
- [ ] Reset or replace patient `1520554001`; it is already hospitalized and blocks the preadmit save flow.
- [ ] Re-run `npx playwright test tests/admit/open-admission.spec.ts --project=chrome` after data reset.

## Architecture

- [ ] Add modal helper methods when confirmation dialogs repeat.
- [ ] Add spinner helper/component if waits become duplicated across pages.
- [ ] Consider moving `Patient` interfaces into `models/` once more domain models exist.

## Completed

- [x] Created project memory documentation.
- [x] Added reusable `NgSelect` component.
- [x] Migrated preadmit steps 04-06 into the existing admission spec.
- [x] Migrated preadmit steps 07-12 into the existing admission spec.
- [x] Added `CashPage` and `CashLocator`.

## Discovered Problems

- Updated token works; current admission failure is now patient data state, not authentication.
- Patient `1520554001` is already hospitalized, so the app shows an alert after save and no print-deny modal appears.
