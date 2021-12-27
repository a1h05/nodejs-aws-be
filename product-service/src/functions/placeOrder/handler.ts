import 'source-map-support/register'

import { middyfyHTTP } from '@libs/lambda'
import { PlaceOrderHandler } from '@functions/placeOrder/placeOrderHandler'
import { LoggerService } from '../../services/loggerService'
import {CommercetoolsClientService} from "../../services/commercetoolsClientService";

const commerceToolsService = new CommercetoolsClientService()
const loggerService = new LoggerService(console)
const handler = new PlaceOrderHandler(commerceToolsService)

export const main = middyfyHTTP({
  handler: handler.placeOrder,
  loggerService,
})
