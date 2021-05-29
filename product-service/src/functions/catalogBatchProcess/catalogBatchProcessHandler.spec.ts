import { LoggerService } from '../../services/loggerService'
import { NewProduct, ProductService } from '../../services/productService'
import { CatalogBatchProcessHandler } from '@functions/catalogBatchProcess/catalogBatchProcessHandler'
import { SQSEvent } from 'aws-lambda/trigger/sqs'
import { mocked } from 'ts-jest/utils'
import { NotificationService } from '../../services/notificationService'

describe('CatalogBatchProcessHandler', () => {
  const rawProduct1 = {
    title: 'title',
    description: 'description1',
    count: '1',
    price: '11',
  }
  const rawProduct2 = {
    title: 'title',
    description: 'description2',
    count: '2',
    price: '12',
  }
  const rawProduct3 = {
    title: 'title',
    description: 'description3',
    count: '3',
    price: '13',
  }
  const product1: NewProduct = {
    title: 'title',
    description: 'description1',
    count: 1,
    price: 11,
  }
  const product2: NewProduct = {
    title: 'title',
    description: 'description2',
    count: 2,
    price: 12,
  }
  const product3: NewProduct = {
    title: 'title',
    description: 'description3',
    count: 3,
    price: 13,
  }
  let loggerService, productService, notificationService, handler
  beforeEach(() => {
    loggerService = ({
      log: jest.fn(),
    } as unknown) as LoggerService
    productService = ({
      createProduct: jest.fn(),
    } as unknown) as ProductService
    notificationService = ({
      sendEmailNotification: jest.fn(),
    } as unknown) as NotificationService
    handler = new CatalogBatchProcessHandler(
      productService,
      loggerService,
      notificationService
    )
  })
  it('should create products from records', async () => {
    const event = {
      Records: [
        { body: JSON.stringify(rawProduct1) },
        { body: JSON.stringify(rawProduct2) },
        { body: JSON.stringify(rawProduct3) },
      ],
    } as SQSEvent
    mocked(productService.createProduct).mockRejectedValue(new Error())

    await handler.catalogBatchProcessHandler(event, undefined, undefined)

    expect(mocked(productService.createProduct).mock.calls).toEqual([
      [product1],
      [product2],
      [product3],
    ])
    expect(notificationService.sendEmailNotification).toHaveBeenCalledWith(
      'Batch Process completed',
      'Congratulations! Batch import was finished',
      product1.count + product2.count + product3.count
    )
  })
})
