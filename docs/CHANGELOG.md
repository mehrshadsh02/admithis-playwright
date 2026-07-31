# Changelog

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
