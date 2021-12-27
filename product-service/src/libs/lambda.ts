import middy from '@middy/core'
import middyJsonBodyParser from '@middy/http-json-body-parser'
import cors from '@middy/http-cors'
import inputOutputLogger from '@middy/input-output-logger'
import httpErrorHandler from '@middy/http-error-handler'
import { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway'
import { LoggerService } from '../services/loggerService'
import { SQSHandler } from 'aws-lambda/trigger/sqs'

interface MiddyfyParams<T> {
  handler: T
  loggerService: LoggerService
}

export const middyfyHTTP = ({
  handler,
  loggerService,
}: MiddyfyParams<ValidatedEventAPIGatewayProxyEvent<any>>) => {
  return middy(handler)
    .use(cors())
    .use(middyJsonBodyParser())
    .use(inputOutputLogger({ logger: loggerService.log }))
    .use(
      httpErrorHandler({
        logger: loggerService.log,
        fallbackMessage: 'Something went wrong',
      })
    )
}

export const middyfySQS = ({
  handler,
  loggerService,
}: MiddyfyParams<SQSHandler>) => {
  return middy(handler)
    .use(inputOutputLogger({ logger: loggerService.log }))
}
