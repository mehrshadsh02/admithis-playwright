import type { APIRequestContext } from '@playwright/test';

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private getHeaders(): Record<string, string> {
    const authBearer = process.env.AUTH_BEARER ?? '';
    const cookieToken = process.env.COOKIE_TOKEN ?? '';

    if (!authBearer) {
      throw new Error('AUTH_BEARER is not configured');
    }

    if (!cookieToken) {
      throw new Error('COOKIE_TOKEN is not configured');
    }

    return {
      Authorization: authBearer,
      Cookie: cookieToken,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': 'fa',
    };
  }

  async get<T>(url: string): Promise<T> {
    const apiUrl = process.env.ADMITHIS_API_URL;

    if (!apiUrl) {
      throw new Error('ADMITHIS_API_URL is not configured');
    }

    const response = await this.request.get(
      `${apiUrl}${url}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok()) {
      throw new Error(
        `API GET failed: ${response.status()} ${await response.text()}`
      );
    }

    return (await response.json()) as T;
  }

  async post<T>(url: string, body: unknown): Promise<T> {
    const apiUrl = process.env.ADMITHIS_API_URL;

    if (!apiUrl) {
      throw new Error('ADMITHIS_API_URL is not configured');
    }

    const response = await this.request.post(
      `${apiUrl}${url}`,
      {
        headers: this.getHeaders(),
        data: body,
      }
    );

    if (!response.ok()) {
      throw new Error(
        `API POST failed: ${response.status()} ${await response.text()}`
      );
    }

    return (await response.json()) as T;
  }
}