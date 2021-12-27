import 'source-map-support/register'

import { middyfySQS } from '@libs/lambda'
import { ProductService } from '../../services/productService'

import { CatalogBatchProcessHandler } from './catalogBatchProcessHandler'
import { LoggerService } from '../../services/loggerService'
import {CommercetoolsClientService} from "../../services/commercetoolsClientService";

const commerceToolsService = new CommercetoolsClientService()
const productService = new ProductService(commerceToolsService)
const loggerService = new LoggerService(console)
const handler = new CatalogBatchProcessHandler(
  productService,
  loggerService,
)

export const main = middyfySQS({
  handler: handler.catalogBatchProcessHandler,
  loggerService,
})
