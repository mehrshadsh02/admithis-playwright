# Changelog

## 2026-07-21

- Created permanent project memory documentation.
- Added reusable `NgSelect` component for Robot `Select From Ng Select` migration.
- Extended admission locators and page object to cover preadmit companion info, clinical info, ward/doctor/prepayment assignment, save, and print-deny.
- Added Cash page/locator workflows for payment and refund by national code.
- Updated `tests/admit/open-admission.spec.ts` to continue the preadmit flow through Robot step 12.
- Fixed the smoke test to open the configured AdmitHis filing URL instead of expecting the Landing app URL.
