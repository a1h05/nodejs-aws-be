import { Client, ClientConfig } from 'pg'

export class DbClientService {
  getClient(): Client {
    if (!this.client) {
      throw new Error('please connect before using client')
    }
    return this.client
  }

  async connect() {
    const {
      PG_HOST,
      PG_PORT,
      PG_DATABASE,
      PG_USERNAME,
      PG_PASSWORD,
    } = process.env
    const dbOptions: ClientConfig = {
      host: PG_HOST,
      port: parseInt(PG_PORT, 10),
      database: PG_DATABASE,
      user: PG_USERNAME,
      password: PG_PASSWORD,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 5000,
    }
    this.client = new Client(dbOptions)

    await this.client.connect()
  }

  async end() {
    if (!this.client) {
      return
    }
    await this.client.end()

    delete this.client
  }

  private client: Client
}
