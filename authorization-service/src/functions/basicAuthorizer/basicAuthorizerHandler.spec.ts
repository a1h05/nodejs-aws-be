import { BasicAuthorizerHandler } from '@functions/basicAuthorizer/basicAuthorizerHandler'
import { AuthService } from '../../services/authService'
import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda/trigger/api-gateway-authorizer'
import { mocked } from 'ts-jest/utils'

describe('BasicAuthorizerHandler', () => {
  describe('handleBasicAuth', () => {
    const authorizationToken = 'token'
    const methodArn = 'methodArn'
    const encodedCreds = 'encodedCreds'
    let authService: AuthService
    let handler: BasicAuthorizerHandler

    beforeEach(() => {
      authService = ({
        getEncodedCreds: jest.fn(),
        canAccessAdminResource: jest.fn(),
      } as unknown) as AuthService
      handler = new BasicAuthorizerHandler(authService)

      mocked(authService.getEncodedCreds).mockReturnValue(encodedCreds)
    })

    it('should say Unauthorized for non-token type', async () => {
      const event = {
        type: 'REQUEST',
        authorizationToken,
        methodArn,
      } as any

      const result = await handler.handleBasicAuth(event, null, null)

      expect(result).toEqual('Unauthorized')
    })
    it('should generate Deny policy for wrong credentials', async () => {
      const event = {
        type: 'TOKEN',
        authorizationToken,
        methodArn,
      } as APIGatewayTokenAuthorizerEvent
      mocked(authService.canAccessAdminResource).mockReturnValue(false)

      const result = await handler.handleBasicAuth(event, null, null)

      expect(authService.getEncodedCreds).toHaveBeenCalledWith(
        authorizationToken
      )
      expect(authService.canAccessAdminResource).toHaveBeenCalledWith(
        authorizationToken
      )
      expect(result).toEqual({
        principalId: encodedCreds,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Deny',
              Resource: methodArn,
            },
          ],
        },
      })
    })
    it('should generate Allow policy for correct credentials', async () => {
      const event = {
        type: 'TOKEN',
        authorizationToken,
        methodArn,
      } as APIGatewayTokenAuthorizerEvent
      mocked(authService.canAccessAdminResource).mockReturnValue(true)

      const result = await handler.handleBasicAuth(event, null, null)

      expect(authService.getEncodedCreds).toHaveBeenCalledWith(
        authorizationToken
      )
      expect(authService.canAccessAdminResource).toHaveBeenCalledWith(
        authorizationToken
      )
      expect(result).toEqual({
        principalId: encodedCreds,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource: methodArn,
            },
          ],
        },
      })
    })
    it('should tell Unauthorized in case of any error', async () => {
      const event = {
        type: 'TOKEN',
        authorizationToken,
        methodArn,
      } as APIGatewayTokenAuthorizerEvent
      mocked(authService.canAccessAdminResource).mockImplementation(() => {
        throw new Error()
      })

      const result = await handler.handleBasicAuth(event, null, null)

      expect(result).toEqual('Unauthorized')
    })
  })
})
