# Architecture

## Layers

- **tests/**: business scenarios and focused unit tests for admission, smoke, logger, and network behavior.
- **pages/**: workflows (`AdmissionPage`, `CashPage`, `CartablePage`, `PatientPage`, `LandingPage`, `BasePage`).
- **components/**: reusable controls (`NgSelect`, `Modal`, `Spinner`, `Toast`, `DatePicker`, `BaseComponent`).
- **locators/**: selector classes for admission, cash, cartable, login, patient, and base areas.
- **fixtures/**: shared Playwright context and network logger setup.
- **data/**: typed preadmit, inpatient, emergency, and patient-admission inputs.
- **models/**: domain state/types.
- **helpers/**: logger, sanitization, reporter, JSON sink, and network logging.
- **config/**: environment loading, routes, constants, and runtime settings.
- **Api/** and **DB/**: API client/patient access and SQL queries/validators.
- **robot/**: legacy source/reference only.

## Reporting and logging

Playwright configures the custom logger reporter plus HTML, Allure, and Monocart reporters. Logger supports levels, redaction, console/file/both destinations, dated JSON-lines files, retention, network failure logging, and artifact modes. Sensitive values are excluded from documentation and logs.

## Dependency and data flow

Tests receive fixtures, import typed data, and call page workflows. Pages use locators/components; pages/components use BasePage actions and helpers. API/DB are supporting integration boundaries.

`Tests → Fixtures/Data → Pages → Components/Locators → Helpers/Config`

## Conventions

Page objects end in `Page`, locator classes in `Locator`, reusable controls use component names, and specs use business-flow names. Keep selectors out of specs and business logic out of locators.

## Migration boundary

This architecture is the completed Robot UI migration result. All additions from this point forward are **New Playwright-native development** unless explicitly historical context.
