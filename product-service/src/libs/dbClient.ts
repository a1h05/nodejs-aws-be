import middy from '@middy/core'
import Middleware = middy.Middleware
import { LoggerService } from '../services/loggerService'
import { DbClientService } from '../services/dbClientService'

export const dbConnectMiddleware: Middleware<{
  loggerService: LoggerService
  dbClientService: DbClientService
}> = ({ dbClientService, loggerService }) => ({
  before: async () => {
    loggerService.log('connect to db')
    await dbClientService.connect()
    loggerService.log('connected to db')
  },
  after: async () => {
    loggerService.log('end db session')
    await dbClientService.end()
    loggerService.log('ended db session')
  },
  onError: async () => {
    loggerService.log('end db session after error')
    await dbClientService.end()
    loggerService.log('ended db session after error')
  },
})
