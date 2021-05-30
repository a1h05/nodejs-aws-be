import { handlerPath } from '@libs/handlerResolver'
import { AWS } from '@serverless/typescript'

const catalogBatchProcessConfiguration: AWS['functions'][''] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        batchSize: 5,
        arn: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      },
    },
  ],
}
export default catalogBatchProcessConfiguration
