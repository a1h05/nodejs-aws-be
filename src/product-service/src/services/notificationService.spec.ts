import { SNS } from 'aws-sdk'
import { LoggerService } from './loggerService'
import { NotificationService } from './notificationService'
import { mocked } from 'ts-jest/utils'

describe('NotificationService', () => {
  it('should send email notification', async () => {
    const sns = ({
      publish: jest.fn(),
    } as unknown) as SNS
    const snsPromise = jest.fn()
    mocked(snsPromise).mockResolvedValue(null)
    mocked(sns.publish).mockImplementation(
      () => ({ promise: snsPromise } as any)
    )
    const loggerService = ({
      log: jest.fn(),
    } as unknown) as LoggerService
    const TargetArn = 'emailTopicARN'
    const notificationService = new NotificationService(
      loggerService,
      sns,
      TargetArn
    )
    const Subject = 'subject'
    const Message = 'message'
    const productCount = 500

    await notificationService.sendEmailNotification(
      Subject,
      Message,
      productCount
    )

    expect(sns.publish).toHaveBeenCalledWith({
      Subject,
      Message,
      TargetArn,
      MessageAttributes: {
        productCount: {
          DataType: 'Number',
          StringValue: JSON.stringify(productCount),
        },
      },
    })
    expect(snsPromise).toHaveBeenCalled()
  })
})
