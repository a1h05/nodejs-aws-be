import middy from '@middy/core'
import middyJsonBodyParser from '@middy/http-json-body-parser'
import cors from '@middy/http-cors'
import inputOutputLogger from '@middy/input-output-logger'
import httpErrorHandler from '@middy/http-error-handler'
import {
  S3EventHandler,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway'
import { LoggerService } from '../services/loggerService'

interface MiddyfyHTTPParams {
  handler: ValidatedEventAPIGatewayProxyEvent<any>
  loggerService: LoggerService
}

interface MiddyfyS3Params {
  handler: S3EventHandler
  loggerService: LoggerService
}

export const middyfyS3 = ({ handler, loggerService }: MiddyfyS3Params) => {
  return middy(handler)
    .use(inputOutputLogger({ logger: loggerService.log }))
    .use(
      httpErrorHandler({
        logger: loggerService.log,
        fallbackMessage: 'Something went wrong',
      })
    )
}

export const middyfyHTTP = ({ handler, loggerService }: MiddyfyHTTPParams) => {
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
