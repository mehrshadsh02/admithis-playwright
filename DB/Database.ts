import sql from 'mssql';

export class Database {
  private pool?: sql.ConnectionPool;

  async connect(): Promise<void> {
    this.pool = await sql.connect({
      server: process.env.DB_SERVER!,
      database: process.env.DB_DATABASE!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    });
  }

  async query<T>(
    query: string,
    params?: Record<string, unknown>
  ): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database is not connected.');
    }

    const request = this.pool.request();

    if (params) {
      for (const [name, value] of Object.entries(params)) {
        request.input(name, value);
      }
    }

    const result = await request.query<T>(query);

    return result.recordset;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = undefined;
    }
  }
}