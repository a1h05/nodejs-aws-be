import { LoggerService } from './loggerService'
import { SNS } from 'aws-sdk'

export class NotificationService {
  constructor(
    private loggerService: LoggerService,
    private sns: SNS,
    private emailTopicARN: string
  ) {}

  async sendEmailNotification(
    Subject: string,
    Message: string,
    productsCount: number
  ) {
    try {
      await this.sns
        .publish({
          Subject,
          Message,
          TargetArn: this.emailTopicARN,
          MessageAttributes: {
            productCount: {
              DataType: 'Number',
              StringValue: JSON.stringify(productsCount),
            },
          },
        })
        .promise()
      this.loggerService.log(
        `sent email ${Subject} ${Message}} count:${productsCount}`
      )
    } catch (e) {
      this.loggerService.log(
        `failed to send ${Subject} ${Message} because of ${JSON.stringify(e)}`
      )
      throw e
    }
  }
}
