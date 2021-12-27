import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
  S3Event,
} from 'aws-lambda'
import type { FromSchema } from 'json-schema-to-ts'

export type ValidatedAPIGatewayProxyEvent<S> = Omit<
  APIGatewayProxyEvent,
  'body'
> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>
export type S3EventHandler = Handler<S3Event, { statusCode: number }>

export const formatJSONResponse = (
  statusCode: number,
  response: any
): { body: string; statusCode: number } => {
  return {
    statusCode,
    body: JSON.stringify(response),
  }
}
