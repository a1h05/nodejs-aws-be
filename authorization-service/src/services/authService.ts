import { LoggerService } from './loggerService'

export class AuthService {
  constructor(
    private loggerService: LoggerService,
    private credentials: Record<string, string>
  ) {}

  canAccessAdminResource(authorisationToken: string): boolean {
    const { username, password } = this.getCredentials(authorisationToken)
    this.loggerService.log(`got username ${username}`)

    return Boolean(
      this.credentials[username] && this.credentials[username] === password
    )
  }

  private getCredentials(
    authorisationToken: string
  ): { password: string; username: string } {
    const encodedCreds = this.getEncodedCreds(authorisationToken)
    const buff = Buffer.from(encodedCreds, 'base64')
    const [username, password] = buff.toString('utf-8').split(':')
    return { username, password }
  }

  getEncodedCreds(authorisationToken: string): string {
    return authorisationToken.split(' ')[1]
  }
}
