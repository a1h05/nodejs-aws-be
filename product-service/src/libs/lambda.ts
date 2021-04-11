import middy from '@middy/core'
import middyJsonBodyParser from '@middy/http-json-body-parser'
import cors from '@middy/http-cors'
import inputOutputLogger from '@middy/input-output-logger'
import { dbConnectMiddleware } from '@libs/dbClient'
import httpErrorHandler from '@middy/http-error-handler'
import { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway'
import { LoggerService } from '../services/loggerService'
import { DbClientService } from '../services/dbClientService'

interface MiddyfyParams {
  handler: ValidatedEventAPIGatewayProxyEvent<any>
  dbClientService: DbClientService
  loggerService: LoggerService
}

export const middyfy = ({
  handler,
  dbClientService,
  loggerService,
}: MiddyfyParams) => {
  return middy(handler)
    .use(cors())
    .use(middyJsonBodyParser())
    .use(inputOutputLogger({ logger: loggerService.log }))
    .use(dbConnectMiddleware({ dbClientService, loggerService }))
    .use(
      httpErrorHandler({
        logger: loggerService.log,
        fallbackMessage: 'Something went wrong',
      })
    )
}
