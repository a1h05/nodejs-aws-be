import 'source-map-support/register'

import { middyfyHTTP } from '@libs/lambda'
import { ProductService } from '../../services/productService'

import { CreateProductHandler } from './createProductHandler'
import { LoggerService } from '../../services/loggerService'
import { DbClientService } from '../../services/dbClientService'

const dbClientService = new DbClientService()
const productService = new ProductService(dbClientService)
const loggerService = new LoggerService(console)
const handler = new CreateProductHandler(productService)

export const main = middyfyHTTP({
  handler: handler.createProductHandler,
  dbClientService,
  loggerService,
})
