# AdmitHis Playwright

Playwright + TypeScript migration of the AdmitHis Robot Framework UI tests.

## Source Of Truth

Robot behavior must be mapped from:

- `robot/AdmitHis-UI.robot`
- `robot/AdmitHis-UI-keywords.resource`
- `robot/AdmitHis-variables.resource`

Do not invent missing business behavior. Specs should stay concise, with selectors and workflows owned by page objects, components, locators, fixtures, and data modules.

## Current State

- Preadmit Robot steps 01-12 are migrated into Playwright structure.
- Inpatient Robot steps 13-20 now continue in `tests/admit/open-admission.spec.ts`.
- The AdmitHis token works as of the latest recorded run.
- The preadmit live flow is blocked by patient data state: patient `1520554001` is already hospitalized.

## Key Docs

Read these before changing code:

- `AGENTS.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/MIGRATION_PROGRESS.md`
- `docs/TODO.md`
- `docs/SESSION_LOG.md`
- `docs/ARCHITECTURE.md`

## Verification

Run at minimum:

```powershell
npx tsc --noEmit
npm run lint
npx playwright test tests/smoke/open-admit.spec.ts --project=chrome
```

Run targeted migrated specs when the internal AdmitHis/Cash environment and test data are ready.
