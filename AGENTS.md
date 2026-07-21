# AdmitHis Playwright Migration Guide

## Purpose

This repository migrates the original Robot Framework AdmitHis UI tests to Playwright with TypeScript.

The Robot source of truth is:

- `robot/AdmitHis-UI.robot`
- `robot/AdmitHis-UI-keywords.resource`
- `robot/AdmitHis-variables.resource`

Do not invent application behavior. Every migration must map back to Robot steps, keywords, and variables.

## Current Migration Strategy

1. Read the Robot scenario and all referenced keywords.
2. Map Robot keywords into page-object methods, components, helpers, or data.
3. Keep specs focused on business flow only.
4. Reuse existing page objects and components before creating new code.
5. Run TypeScript, lint, and relevant Playwright tests.
6. Update `docs/` after every meaningful change.

## Architecture Rules

Preferred dependency direction:

Pages -> Components -> Helpers -> Fixtures -> Data -> Models -> Tests

Responsibilities:

- `pages/`: user workflows and page behavior.
- `components/`: reusable UI controls such as ng-select, modals, spinners, toasts, and date pickers.
- `locators/`: locator-only classes for page objects.
- `data/`: stable test data translated from Robot variables.
- `fixtures/`: Playwright setup and shared test context.
- `config/`: environment, routes, constants.
- `tests/`: concise business scenarios.
- `robot/`: read-only source implementation.

## Coding Standards

- TypeScript strict mode is enabled.
- Keep locators centralized in locator classes unless a one-off assertion is clearer.
- Prefer typed method arguments and return `Promise<void>` for page actions.
- Do not add complex logic directly to spec files.
- Preserve existing behavior and selectors unless the application proves they are wrong.
- Do not commit secrets or new credentials. Existing `.env` and Robot variables contain environment-specific values and should be treated carefully.

## Verification

Minimum checks before marking a migration complete:

- `npx tsc --noEmit`
- `npm run lint`
- Relevant `npx playwright test ...`

If the AdmitHis internal environment is unreachable, document the failed command and error in:

- `docs/PROJECT_CONTEXT.md`
- `docs/TODO.md`
- `docs/SESSION_LOG.md`

## Continuation Instructions

Start every session by reading:

1. `AGENTS.md`
2. `docs/PROJECT_CONTEXT.md`
3. `docs/MIGRATION_PROGRESS.md`
4. `docs/TODO.md`
5. `docs/SESSION_LOG.md`

Then continue from the first migration marked `Pending` or `In progress`.
