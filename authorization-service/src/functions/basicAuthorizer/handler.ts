import 'source-map-support/register'

import { middyfyAuth } from '@libs/lambda'
import { AuthService } from '../../services/authService'

import { BasicAuthorizerHandler } from './basicAuthorizerHandler'
import { LoggerService } from '../../services/loggerService'

const loggerService = new LoggerService(console)
const imageService = new AuthService(loggerService, process.env)
const handler = new BasicAuthorizerHandler(imageService)

export const main = middyfyAuth({
  handler: handler.handleBasicAuth,
  loggerService,
})
