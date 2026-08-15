import type { ApiClient } from './ApiClient';

export interface GetPatientByAdmitIdResponse {
  hisAdmitDto: {
    diagnosis: string;
    insuranceID: number;
    insuranceExpDate: string;
    bedId: number;
    wardIdIn:number;
  };
}

export class PatientApi {
  constructor(private readonly api: ApiClient) {}

  async getPatientByAdmitId(
    admitId: number
  ): Promise<GetPatientByAdmitIdResponse> {
    // return this.api.get<GetPatientByAdmitIdResponse>(
    //   `/api/Patient/GetPatientByAdmitID?admitId=${admitId}`
    // );
    const result = await this.api.get<unknown>(
      `/api/Patient/GetPatientByAdmitID?admitId=${admitId}`
    );

    console.log(
        'GetPatientByAdmitID RESPONSE:',
        JSON.stringify(result, null, 2)
    );

    return result as GetPatientByAdmitIdResponse;
  }
}