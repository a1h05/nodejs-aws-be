import { handlerPath } from '@libs/handlerResolver'
import type {AWS} from "@serverless/typescript";

const configuration: AWS['functions'][''] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        cors: true,
        authorizer: {
          arn: '${cf:authorization-service-dev.authLambdaARN}',
          name: 'basicAuthorizer',
          resultTtlInSeconds: 0,
          identitySource: 'method.request.header.Authorization',
          type: 'token'
        },
        request: {
          parameters: {
            querystrings: {
              name: true,
            },
          },
        },
      },
    },
  ],
}


export default configuration
