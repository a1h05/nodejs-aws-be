import { NewProduct, ProductService } from '../../services/productService'
import { SQSHandler } from 'aws-lambda/trigger/sqs'
import { LoggerService } from '../../services/loggerService'

export class CatalogBatchProcessHandler {
  constructor(
    private productService: ProductService,
    private loggerService: LoggerService,
  ) {}

  catalogBatchProcessHandler: SQSHandler = async event => {
    try {
      const products: NewProduct[] = event.Records.map(({ body }) =>
        JSON.parse(body)
      ).map(parsed => ({
        title: parsed.title,
        slug: parsed.slug,
        price: Number.parseInt(parsed.price, 10),
      }))
      for (const product of products) {
        try {
          await this.productService.createProduct(product)
          this.loggerService.log(
            `${JSON.stringify(product)} was successfully imported`
          )
        } catch (e) {
          this.loggerService.log(
            `${JSON.stringify(
              product
            )} failed to import because of ${JSON.stringify(e)}`
          )
        }
      }

      this.loggerService.log(
          'Batch Process completed',
          'Congratulations! Batch import was finished',
      )
    } catch (e) {
      this.loggerService.log(
        `catalogBatchProcessHandler failed with ${JSON.stringify(e)}`
      )
    }
  }
}
