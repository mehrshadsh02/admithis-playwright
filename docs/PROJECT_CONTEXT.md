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
- `pages/BasePage.ts`: navigation and page readiness.
- `pages/CashPage.ts`: cash payment/refund flow by national code.
- `data/patient.ts`: current Robot patient data.

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

## Next Recommended Step

Run TypeScript, lint, and `tests/admit/open-admission.spec.ts` from WSL 2, Linux Node, or Windows PowerShell. Then live-verify with patient data that permits the sequential preadmit and inpatient flow.
