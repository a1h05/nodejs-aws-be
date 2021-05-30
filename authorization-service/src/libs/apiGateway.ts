import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
  S3Event,
} from 'aws-lambda'
import type { FromSchema } from 'json-schema-to-ts'
import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda/trigger/api-gateway-authorizer'

export type ValidatedAPIGatewayProxyEvent<S> = Omit<
  APIGatewayProxyEvent,
  'body'
> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>
export type S3EventHandler = Handler<S3Event, { statusCode: number }>
export type APIGatewayTokenAuthorizerHandler = Handler<
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult | string
>

export const formatJSONResponse = (
  statusCode: number,
  response: any
): { body: string; statusCode: number } => {
  return {
    statusCode,
    body: JSON.stringify(response),
  }
}
