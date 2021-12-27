import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway'
import shema from '@functions/createProduct/schema'
import {
  Product,
  ProductService,
  ValidationError,
} from '../../services/productService'

export class CreateProductHandler {
  constructor(private productService: ProductService) {}

  createProductHandler: ValidatedEventAPIGatewayProxyEvent<
    typeof shema
  > = async event => {
    try {
      const newProduct: Product = {
        title: event.body.title,
        slug: event.body.slug,
        sku: event.body.sku,
        description: event.body.description,
        price: event.body.price,
        count: event.body.count,
        // id: event.body.id
      }
      // if (newProduct.id) {
      //   const product = await this.productService.updateProduct(newProduct)
      //   return formatJSONResponse(200, product)
      // } else {
        const product = await this.productService.createProduct(newProduct)
        return formatJSONResponse(201, product)
      // }

    } catch (e) {
      if (e instanceof ValidationError) {
        console.log(JSON.stringify(e))
        return formatJSONResponse(400, {
          message: 'Invalid body was provided',
        })
      }
      throw e
    }
  }
}
