# Migration Progress

| Robot source        | Test name                                         | Playwright destination               | Status   | Notes                                                                   |
| ------------------- | ------------------------------------------------- | ------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `AdmitHis-UI.robot` | `01-UI - Open Filing Page`                        | `tests/admit/open-admission.spec.ts` | Migrated | Opens AdmitHis filing page with token. Current run reaches the app.     |
| `AdmitHis-UI.robot` | `02-UI - Enter national code of preadmit patient` | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.searchPatient`.                                     |
| `AdmitHis-UI.robot` | `03-UI - Fill Patient PreAdmit Info`              | `tests/admit/open-admission.spec.ts` | Migrated | Includes demographic, companion, and clinical fields.                   |
| `AdmitHis-UI.robot` | `04-UI - Assign Ward And Doctor And Prepayment`   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.assignWardDoctorAndPrepayment`.                     |
| `AdmitHis-UI.robot` | `05-UI - Save Admission Filing`                   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.saveAdmissionFiling`.                               |
| `AdmitHis-UI.robot` | `06-UI - deny admit print page`                   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.denyAdmitPrintPage`.                                |
| `AdmitHis-UI.robot` | `07-UI - Open Cash Web And Pay`                   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `CashPage.payPatientByNationalCode`.                               |
| `AdmitHis-UI.robot` | `08-UI - go to inpatient list`                    | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.openInpatientList`.                                 |
| `AdmitHis-UI.robot` | `09-UI - Load Preadmit Patient List`              | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.loadPreadmitPatientList`.                           |
| `AdmitHis-UI.robot` | `10-UI - Edit Preadmit Patient`                   | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.editPreadmitWardAndDoctor`.                         |
| `AdmitHis-UI.robot` | `11-UI - Cancel Preadmit`                         | `tests/admit/open-admission.spec.ts` | Migrated | Uses `AdmissionPage.cancelPreadmit`.                                    |
| `AdmitHis-UI.robot` | `12-UI - Open Cash Web And Refund`                | `tests/admit/open-admission.spec.ts` | Migrated | Uses `CashPage.refundPatientByNationalCode`.                            |
| `AdmitHis-UI.robot` | `13-UI - Open Filling Page`                       | Not created                          | Pending  | Inpatient workflow begins.                                              |
| `AdmitHis-UI.robot` | `14-UI - Enter national code of inpatient`        | Not created                          | Pending  | Similar to step 02.                                                     |
| `AdmitHis-UI.robot` | `15-UI - Fill inpatient Info`                     | Not created                          | Pending  | Adds `patientClass`.                                                    |
| `AdmitHis-UI.robot` | `16-UI - Assign Ward And Doctor`                  | Not created                          | Pending  | Adds bed selection.                                                     |
| `AdmitHis-UI.robot` | `17-UI - Save Admission Filing`                   | Not created                          | Pending  | Includes confirm modal.                                                 |
| `AdmitHis-UI.robot` | `18-UI - deny admit print page`                   | Not created                          | Pending  | Same deny-print behavior.                                               |
| `AdmitHis-UI.robot` | `19-UI - go to inpatient list`                    | Not created                          | Pending  | Similar to step 08.                                                     |
| `AdmitHis-UI.robot` | `20-UI - Edit Preadmit Patient`                   | Not created                          | Pending  | Inpatient edit asserts disabled fields and changes responsible patient. |
