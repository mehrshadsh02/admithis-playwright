# Migration Progress

| Robot source        | Test name                                         | Playwright destination               | Status   | Notes                                                               |
| ------------------- | ------------------------------------------------- | ------------------------------------ | -------- | ------------------------------------------------------------------- |
| `AdmitHis-UI.robot` | `01-UI - Open Filing Page`                        | `tests/admit/open-admission.spec.ts` | Migrated | Opens AdmitHis filing page with token. Current run reaches the app. |
| `AdmitHis-UI.robot` | `02-UI - Enter national code of preadmit patient` | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.searchPatient`.                                 |
| `AdmitHis-UI.robot` | `03-UI - Fill Patient PreAdmit Info`              | `tests/admit/open-admission.spec.ts` | Migrated | Includes demographic, companion, and clinical fields.               |
| `AdmitHis-UI.robot` | `04-UI - Assign Ward And Doctor And Prepayment`   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.assignWardDoctorAndPrepayment`.                 |
| `AdmitHis-UI.robot` | `05-UI - Save Admission Filing`                   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.saveAdmissionFiling`.                           |
| `AdmitHis-UI.robot` | `06-UI - deny admit print page`                   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.denyAdmitPrintPage`.                            |
| `AdmitHis-UI.robot` | `07-UI - Open Cash Web And Pay`                   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `CashPage.payPatientByNationalCode`.                           |
| `AdmitHis-UI.robot` | `08-UI - go to inpatient list`                    | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.openInpatientList`.                             |
| `AdmitHis-UI.robot` | `09-UI - Load Preadmit Patient List`              | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.loadPreadmitPatientList`.                       |
| `AdmitHis-UI.robot` | `10-UI - Edit Preadmit Patient`                   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.editPreadmitWardAndDoctor`.                     |
| `AdmitHis-UI.robot` | `11-UI - Cancel Preadmit`                         | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.cancelPreadmit`.                                |
| `AdmitHis-UI.robot` | `12-UI - Open Cash Web And Refund`                | `tests/admit/open-admission.spec.ts` | Migrated | Uses `CashPage.refundPatientByNationalCode`.                        |
| `AdmitHis-UI.robot` | `13-UI - Open Filling Page`                       | `tests/admit/open-admission.spec.ts` | Migrated | Continues the existing admission flow with `AdmissionPage.open`.    |
| `AdmitHis-UI.robot` | `14-UI - Enter national code of inpatient`        | `tests/admit/open-admission.spec.ts` | Migrated | Reuses national-code search workflow.                               |
| `AdmitHis-UI.robot` | `15-UI - Fill inpatient Info`                     | `tests/admit/open-admission.spec.ts` | Migrated | Adds `patientClass` after shared patient details.                   |
| `AdmitHis-UI.robot` | `16-UI - Assign Ward And Doctor`                  | `tests/admit/open-admission.spec.ts` | Migrated | Adds inpatient bed selection.                                       |
| `AdmitHis-UI.robot` | `17-UI - Save Admission Filing`                   | `tests/admit/open-admission.spec.ts` | Migrated | Adds the inpatient confirmation modal.                              |
| `AdmitHis-UI.robot` | `18-UI - deny admit print page`                   | `tests/admit/open-admission.spec.ts` | Migrated | Reuses deny-print behavior.                                         |
| `AdmitHis-UI.robot` | `19-UI - go to inpatient list`                    | `tests/admit/open-admission.spec.ts` | Migrated | Reuses inpatient-list navigation.                                   |
| `AdmitHis-UI.robot` | `20-UI - Edit Preadmit Patient`                   | `tests/admit/open-admission.spec.ts` | Migrated | Verifies disabled fields and changes responsible patient to spouse. |

## Framework Work

| Area    | Scope                            | Destination                              | Status      | Notes                                                                                                                                                                                   |
| ------- | -------------------------------- | ---------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logging | Phase 1 core logging foundation  | `helpers/logger/` and Playwright config  | Implemented | Central API, env config, sanitization, reporter integration, unit tests.                                                                                                                |
| Logging | Phase 2 lifecycle + step logging | `PlaywrightLoggerReporter.ts` and config | Implemented | Automatic lifecycle, retry, duration, execution context, and existing `test.step` logging. Windows PowerShell validation passed; repository-wide formatter drift remains outside scope. |
| Logging | Phase 3 structured file logging  | `JsonFileLogSink.ts` and logger config   | Implemented | Structured JSON-lines output, `LOG_OUTPUT`, `LOG_RETENTION_DAYS`, retention cleanup, and centralized redaction.                                                                         |
| Logging | Phase 4 SafeActions & WaitEngine | `pages/BasePage.ts`                      | In progress | Central logger integration, spinner-safe waits, contextual safe actions, and sensitive-value redaction are implemented; focused UI validation is blocked by internal-host timeout.      |
