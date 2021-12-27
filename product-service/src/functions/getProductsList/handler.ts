import 'source-map-support/register'

import { middyfyHTTP } from '@libs/lambda'
import { ProductService } from '../../services/productService'
import { GetProductsListHandler } from '@functions/getProductsList/getProductsListHandler'
import { LoggerService } from '../../services/loggerService'
import {CommercetoolsClientService} from "../../services/commercetoolsClientService";

const commerceToolsService = new CommercetoolsClientService()
const productService = new ProductService(commerceToolsService)
const loggerService = new LoggerService(console)
const handler = new GetProductsListHandler(productService, loggerService)

export const main = middyfyHTTP({
  handler: handler.getProductsList,
  loggerService,
})
