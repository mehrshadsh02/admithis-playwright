# AdmitHis Playwright

AdmitHis UI automation implemented with Playwright and TypeScript.

## Project state

- **Robot Framework UI → Playwright migration: COMPLETED.** Robot files are legacy/historical references and are no longer the input for new development.
- **Current direction: Playwright-native development.** New tests, fixtures, helpers, reporting, and features are designed directly for Playwright + TypeScript.
- Existing Robot scenarios remain under `robot/` for historical traceability.

## Current architecture

`tests/` contains business flows and unit coverage. `pages/` owns workflows, `components/` reusable controls, `locators/` selectors, `fixtures/` shared Playwright context, `data/` typed test data, `models/` domain types, `helpers/` cross-cutting utilities, and `config/` environment/routes/constants. `Api/` and `DB/` provide supporting integration layers.

Configured reporting includes the custom logger reporter, HTML, Allure, and Monocart. Logger output supports console and optional JSON-lines files with redaction and retention.

## Important commands

```bash
npx tsc --noEmit
npm run lint
npx playwright test
npx playwright test tests/smoke/open-admit.spec.ts --project=chrome
npm run format:check
```

Use environment configuration for internal URLs and credentials; never place secrets in source or documentation.

## Documentation map

- `docs/PROJECT_CONTEXT.md` — current snapshot
- `docs/MIGRATION_PROGRESS.md` — completed migration history and boundary
- `docs/ARCHITECTURE.md` — implemented layers and data flow
- `docs/TODO.md` — native current/future work
- `docs/SESSION_LOG.md` — dated implementation and verification history

Always distinguish **Implemented** (code exists) from **Verified** (a command/test validated it).
Future work is **New Playwright-native development**.
