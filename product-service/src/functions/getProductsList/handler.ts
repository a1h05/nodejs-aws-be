import 'source-map-support/register'

import { middyfyHTTP } from '@libs/lambda'
import { ProductService } from '../../services/productService'
import { GetProductsListHandler } from '@functions/getProductsList/getProductsListHandler'
import { LoggerService } from '../../services/loggerService'
import { DbClientService } from '../../services/dbClientService'

const dbClientService = new DbClientService()
const productService = new ProductService(dbClientService)
const loggerService = new LoggerService(console)
const handler = new GetProductsListHandler(productService, loggerService)

export const main = middyfyHTTP({
  handler: handler.getProductsList,
  dbClientService,
  loggerService,
})
