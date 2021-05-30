import { NewProduct, ProductService } from '../../services/productService'
import { SQSHandler } from 'aws-lambda/trigger/sqs'
import { LoggerService } from '../../services/loggerService'
import { NotificationService } from '../../services/notificationService'

export class CatalogBatchProcessHandler {
  constructor(
    private productService: ProductService,
    private loggerService: LoggerService,
    private notificationService: NotificationService
  ) {}

  catalogBatchProcessHandler: SQSHandler = async event => {
    try {
      const products: NewProduct[] = event.Records.map(({ body }) =>
        JSON.parse(body)
      ).map(parsed => ({
        title: parsed.title,
        description: parsed.description,
        count: Number.parseInt(parsed.count, 10),
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

      const productsCount = products.reduce((acc, b) => acc + b.count, 0)
      await this.notificationService.sendEmailNotification(
        'Batch Process completed',
        'Congratulations! Batch import was finished',
        productsCount
      )
    } catch (e) {
      this.loggerService.log(
        `catalogBatchProcessHandler failed with ${JSON.stringify(e)}`
      )
    }
  }
}
