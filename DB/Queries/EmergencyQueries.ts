export const EmergencyQueries = {
  getEmergencyAdmissionById: `
    SELECT
      dbo.Admit_HIS.ID_Admit,
      dbo.Admit_HIS.FileFormationID,
      dbo.Admit_HIS.AdmitDate,
      dbo.Admit_HIS.DischargeStep,
      dbo.Admit_HIS.WardIdIn,
      dbo.Admit_HIS.PatientClass,
      dbo.Admit_HIS.Priority,
      dbo.Admit_HIS.Diagnosis,
      dbo.Admit_HIS.InsuranceID,
      dbo.Admit_HIS.InsuranceExpDate,
      dbo.Admit_HIS.Status_AdmitHIS,
      dbo.Admit_HIS.EmergencyNo,
      dbo.Patient_Movement.PreBedID,
      dbo.Patient_Movement.BedID,
      dbo.Tbl_Bed.ID_Bed,
      dbo.Tbl_Bed.BedStatus,
      dbo.Tbl_Bed.WardID,
      dbo.ICD_Madarek.ICDCode,
      dbo.TotalCash.ClinicTitleType,
      dbo.TotalCash.CashType
    FROM dbo.Admit_HIS

    INNER JOIN dbo.Patient_Movement
      ON dbo.Admit_HIS.ID_Admit = dbo.Patient_Movement.AdmitID

    INNER JOIN dbo.Tbl_Bed
      ON dbo.Patient_Movement.AdmitID = dbo.Tbl_Bed.AdmitID

    INNER JOIN dbo.ICD_Madarek
      ON dbo.Tbl_Bed.AdmitID = dbo.ICD_Madarek.AdmitID

    INNER JOIN dbo.TotalCash
      ON dbo.ICD_Madarek.AdmitID = dbo.TotalCash.AdmitID

    WHERE dbo.Admit_HIS.ID_Admit = @admitId
  `,
};