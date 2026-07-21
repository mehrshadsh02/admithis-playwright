# Project Context

## Goal

Completely migrate the Robot Framework AdmitHis UI tests to Playwright + TypeScript with a maintainable automation architecture.

## Current Status

The repository already had a Playwright scaffold and the first admission spec. This session created the permanent project memory docs and extended the preadmit migration.

Completed or partially completed:

- Robot steps 01-12 are now represented in `tests/admit/open-admission.spec.ts`.
- `AdmissionPage` contains reusable methods for the preadmit filing workflow through save, print-deny, inpatient list navigation, edit, and cancel.
- `CashPage` contains reusable methods for prepayment and refund by national code.
- `NgSelect` component maps Robot's generic ng-select keyword.

Pending:

- Robot steps 13-20: inpatient admission workflow.

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
- Some files are placeholders and should be filled only when needed.
- Persian strings appear mojibaked in source files; keep them stable for now because they came from the existing Robot suite.

## Next Recommended Step

Reset or replace the preadmit test patient data, then rerun `npx playwright test tests/admit/open-admission.spec.ts --project=chrome`. After the preadmit workflow is stable, continue Robot step 13 through step 20.
