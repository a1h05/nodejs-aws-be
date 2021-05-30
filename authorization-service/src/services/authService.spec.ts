import { LoggerService } from './loggerService'
import { AuthService } from './authService'

describe('AuthService', () => {
  const loggerService = ({
    log: jest.fn(),
  } as unknown) as LoggerService
  const username = 'username'
  const password = 'password'
  const authService = new AuthService(loggerService, { [username]: password })

  describe('getEncodedCreds', () => {
    it('should get encoded credentials', () => {
      const encodedCredentials = Buffer.from(`username:password`).toString(
        'base64'
      )
      const token = `Basic ${encodedCredentials}`

      expect(authService.getEncodedCreds(token)).toEqual(encodedCredentials)
    })
  })

  describe('canAccessAdminResource', () => {
    it('should return false for unknown login', () => {
      const encodedCredentials = Buffer.from(
        `someUserName:somePassword`
      ).toString('base64')
      const token = `Basic ${encodedCredentials}`

      expect(authService.canAccessAdminResource(token)).toEqual(false)
    })
    it('should return false if password does not match', () => {
      const encodedCredentials = Buffer.from(
        `${username}:somePassword`
      ).toString('base64')
      const token = `Basic ${encodedCredentials}`

      expect(authService.canAccessAdminResource(token)).toEqual(false)
    })
    it('should return true if correct credentials were provided', () => {
      const encodedCredentials = Buffer.from(
        `${username}:${password}`
      ).toString('base64')
      const token = `Basic ${encodedCredentials}`

      expect(authService.canAccessAdminResource(token)).toEqual(true)
    })
  })
})
