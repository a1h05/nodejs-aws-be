import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway'
import {
  NotFoundError,
  ProductService,
  ValidationError,
} from '../../services/productService'

export class DeleteProductHandler {
  constructor(private productService: ProductService) {}
  deleteProduct: ValidatedEventAPIGatewayProxyEvent<void> = async event => {
    try {
      await this.productService.deleteProduct(
        event.pathParameters.productId
      )
      return await formatJSONResponse(204, {})
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
