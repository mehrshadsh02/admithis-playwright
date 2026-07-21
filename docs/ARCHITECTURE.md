# Architecture

## Overview

The project is a Playwright + TypeScript end-to-end test suite for AdmitHis UI workflows. It is being migrated from Robot Framework while improving maintainability.

## Folder Structure

- `tests/`: Playwright specs. Specs should read as business flows and delegate details to page objects.
- `pages/`: page objects and workflow methods.
- `locators/`: locator classes used by page objects.
- `components/`: reusable UI components.
- `data/`: typed test data translated from Robot variables.
- `fixtures/`: shared Playwright fixtures. Currently empty.
- `config/`: shared constants and environment/routing placeholders.
- `robot/`: source Robot Framework tests and resources.

## Page Objects

`pages/AdmissionPage.ts` is the primary active page object. It currently supports:

- opening the admission filing page
- selecting Iranian nationality
- entering and inquiring national code
- filling patient demographic, companion, and clinical information
- assigning ward, doctor, responsible patient, and prepayment
- saving an admission filing
- denying the print page modal
- opening the inpatient list
- loading the preadmit list
- editing a preadmit patient's ward/doctor
- canceling a preadmit patient

`pages/BasePage.ts` provides navigation, page readiness, and URL verification.

`pages/CashPage.ts` supports cash search, prepayment, and refund flows by national code.

## Components

`components/NgSelect.ts` centralizes Angular `ng-select` interaction by `formcontrolname`. This maps Robot's `Select From Ng Select` keyword.

Other component files exist as placeholders:

- `Modal.ts`
- `Spinner.ts`
- `Toast.ts`
- `DatePicker.ts`

Use these before adding repeated modal/spinner/toast/date logic to pages.

## Locators

Locator classes should contain selectors only. Page objects should own behavior.

`locators/AdmissionLocator.ts` contains active admission filing selectors.

`locators/CashLocator.ts` contains active Cash app selectors.

## Data Flow

Robot variables are translated into typed TypeScript data in `data/patient.ts`.

Tests import stable data and pass it to page methods. Page methods choose the controls and sequence.

## Naming Conventions

- Page objects: `XPage`
- Locator classes: `XLocator`
- Components: UI control name, for example `NgSelect`
- Specs: business flow, for example `open-admission.spec.ts`
- Test names: user-visible workflow names, not implementation details

## Architectural Decisions

- Robot keyword `Select From Ng Select` is implemented once in `NgSelect`.
- The first migrated spec remains in `tests/admit/open-admission.spec.ts` and is extended rather than duplicated.
- Mojibake Persian text from Robot is preserved as-is for selector/data compatibility until encoding is intentionally corrected across the project.
