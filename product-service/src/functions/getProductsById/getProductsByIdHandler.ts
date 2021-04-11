import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway'
import {
  NotFoundError,
  ProductService,
  ValidationError,
} from '../../services/productService'

export class GetProductsByIdHandler {
  constructor(private productService: ProductService) {}
  getProductsById: ValidatedEventAPIGatewayProxyEvent<void> = async event => {
    try {
      const product = await this.productService.getProductById(
        event.pathParameters.productId
      )
      return await formatJSONResponse(200, product)
    } catch (e) {
      if (e instanceof ValidationError) {
        return formatJSONResponse(400, {
          message: 'Invalid ID was provided',
        })
      }
      if (e instanceof NotFoundError) {
        return formatJSONResponse(404, { message: 'Product was not found' })
      }
      throw e
    }
  }
}
