# AdmitHis Playwright Development Guide

## Scope

This is a Playwright + TypeScript project. The Robot Framework UI migration is **COMPLETED**. Files under `robot/` are read-only legacy references for historical behavior, traceability, and migration history; Robot is not the input for future development.

Do not invent application behavior. For legacy behavior, consult Robot and existing Playwright code. For new work, use actual Playwright source and tests as the primary source of truth.

## Current development rule

Every feature, test, fixture, helper, reporting improvement, refactor, or architecture change after migration is **New Playwright-native development** unless explicitly identified as historical migration work.

## Architecture rules

Preferred direction: `Pages -> Components -> Helpers -> Fixtures -> Data -> Models -> Tests`.

- `pages/`: workflows and page behavior.
- `components/`: reusable UI controls.
- `locators/`: centralized selector classes.
- `fixtures/`: shared Playwright setup/context.
- `data/`: stable typed test data.
- `models/`: domain types/state.
- `helpers/`: logging and cross-cutting utilities.
- `config/`: environment, routes, constants, Playwright configuration.
- `Api/`, `DB/`: supporting integration layers.
- `tests/`: concise business and unit scenarios.
- `robot/`: legacy reference only.

Keep specs focused on business flow, reuse existing abstractions, preserve selectors unless evidence proves otherwise, and keep secrets out of source and documentation.

## Verification and documentation

For meaningful changes, run applicable TypeScript, lint, and Playwright checks. Record exact commands and outcomes, distinguishing Implemented from Verified. Update documentation after meaningful changes, especially project context, TODO, and session log.
