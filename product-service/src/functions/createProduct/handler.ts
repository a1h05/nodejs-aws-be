import 'source-map-support/register'

import { middyfyHTTP } from '@libs/lambda'
import { ProductService } from '../../services/productService'

import { CreateProductHandler } from './createProductHandler'
import { LoggerService } from '../../services/loggerService'
import {CommercetoolsClientService} from "../../services/commercetoolsClientService";

const commerceToolsService = new CommercetoolsClientService()
const productService = new ProductService(commerceToolsService)
const loggerService = new LoggerService(console)
const handler = new CreateProductHandler(productService)

export const main = middyfyHTTP({
  handler: handler.createProductHandler,
  loggerService,
})
