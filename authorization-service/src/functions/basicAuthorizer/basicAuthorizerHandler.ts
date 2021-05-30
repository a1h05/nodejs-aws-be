import { AuthService } from '../../services/authService'
import { APIGatewayTokenAuthorizerHandler } from '@libs/apiGateway'
import { APIGatewayAuthorizerResult } from 'aws-lambda/trigger/api-gateway-authorizer'

export class BasicAuthorizerHandler {
  constructor(private authService: AuthService) {}

  handleBasicAuth: APIGatewayTokenAuthorizerHandler = async event => {
    try {
      if (event.type !== 'TOKEN') {
        return 'Unauthorized'
      }

      const authorisationToken = event.authorizationToken

      const encodedCreds = this.authService.getEncodedCreds(authorisationToken)
      const effect = this.authService.canAccessAdminResource(authorisationToken)
        ? 'Allow'
        : 'Deny'

      return this.generatePolicy(encodedCreds, event.methodArn, effect)
    } catch (e) {
      return `Unauthorized`
    }
  }

  private generatePolicy(
    principalId: string,
    Resource: string,
    Effect: 'Deny' | 'Allow'
  ): APIGatewayAuthorizerResult {
    return {
      principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect,
            Resource,
          },
        ],
      },
    }
  }
}
