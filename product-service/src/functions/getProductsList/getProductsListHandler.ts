import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway'
import { ProductService } from '../../services/productService'
import { LoggerService } from '../../services/loggerService'

export class GetProductsListHandler {
  constructor(
    private productService: ProductService,
    private loggerService: LoggerService
  ) {}

  getProductsList: ValidatedEventAPIGatewayProxyEvent<void> = async () => {
    this.loggerService.log('getProductsList started')
    const products = await this.productService.getProducts()
    this.loggerService.log(
      `getProductsList: got getProducts: ${JSON.stringify(products)}`
    )
    return formatJSONResponse(200, products)
  }
}
