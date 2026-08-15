import { expect } from '@playwright/test';
import type { EmergencyAdmissionState } from '../../models/EmergencyAdmissionState';
import type { Database } from '../Database';
import { EmergencyQueries } from '../Queries/EmergencyQueries';

interface EmergencyAdmissionRow {
  ID_Admit: number;
  FileFormationID: number;
  AdmitDate: string;
  DischargeStep: number;
  WardIdIn: number;
  PatientClass: number;
  Priority: number;
  Diagnosis: string;
  InsuranceID: number;
  InsuranceExpDate: string;
  Status_AdmitHIS: number;
  EmergencyNo: number | string;
  PreBedID: number;
  BedID: number;
  ID_Bed: number;
  BedStatus: number;
  WardID: number;
  ICDCode: string;
  ClinicTitleType: number;
  CashType: number;
}

export async function validateEmergencyAdmission(
  db: Database,
  state: EmergencyAdmissionState
): Promise<void> {
  const rows = await db.query<EmergencyAdmissionRow>(
    EmergencyQueries.getEmergencyAdmissionById,
    {
      admitId: state.admitId,
    }
  );

  expect(rows.length).toBeGreaterThan(0);

  const row = rows[0];

  if (!row) {
    throw new Error(
      `Emergency admission not found in database. admitId=${state.admitId}`
    );
  }

  expect(row.ID_Admit).toBe(state.admitId);

  expect(row.FileFormationID).toBe(state.fileFormationId);

  expect(row.DischargeStep).toBe(4);

  expect(row.WardIdIn).toBe(state.wardIdIn);

  expect(row.PatientClass).toBe(0);

  expect(row.Priority).toBe(2);

  expect(row.Diagnosis).toContain(state.diagnosisName);

  expect(row.InsuranceID).toBe(state.insuranceId);

  expect(row.InsuranceExpDate).toBe(state.insuranceExpDate);

  expect(row.Status_AdmitHIS).toBe(0);

  expect(row.EmergencyNo).toBeTruthy();

  expect(row.PreBedID).toBe(0);

  expect(row.BedID).toBe(state.bedId);

  expect(row.ID_Bed).toBe(state.bedId);

  expect(row.BedStatus).toBe(1);

  expect(row.WardID).toBe(state.wardIdIn);

  expect(row.ICDCode).toBeTruthy();

  expect(row.ClinicTitleType).toBe(249);
}