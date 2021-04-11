import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway'
import shema from '@functions/createProduct/schema'
import {
  NewProduct,
  ProductService,
  ValidationError,
} from '../../services/productService'

export class CreateProductHandler {
  constructor(private productService: ProductService) {}

  createProductHandler: ValidatedEventAPIGatewayProxyEvent<
    typeof shema
  > = async event => {
    try {
      const newProduct: NewProduct = {
        title: event.body.title,
        description: event.body.description,
        count: event.body.count,
        price: event.body.price,
      }
      const product = await this.productService.createProduct(newProduct)

      return formatJSONResponse(201, product)
    } catch (e) {
      if (e instanceof ValidationError) {
        return formatJSONResponse(400, {
          message: 'Invalid body was provided',
        })
      }
      throw e
    }
  }
}
