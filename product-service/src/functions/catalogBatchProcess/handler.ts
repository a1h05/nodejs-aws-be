import 'source-map-support/register'

import { middyfySQS } from '@libs/lambda'
import { ProductService } from '../../services/productService'

import { CatalogBatchProcessHandler } from './catalogBatchProcessHandler'
import { LoggerService } from '../../services/loggerService'
import { DbClientService } from '../../services/dbClientService'
import { NotificationService } from '../../services/notificationService'
import { SNS } from 'aws-sdk'

const dbClientService = new DbClientService()
const productService = new ProductService(dbClientService)
const loggerService = new LoggerService(console)
const notificationService = new NotificationService(
  loggerService,
  new SNS({ region: process.env.SNS_REGION }),
  process.env.SNS_ARN
)
const handler = new CatalogBatchProcessHandler(
  productService,
  loggerService,
  notificationService
)

export const main = middyfySQS({
  handler: handler.catalogBatchProcessHandler,
  dbClientService,
  loggerService,
})
