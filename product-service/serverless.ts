import type { AWS } from '@serverless/typescript'

import getProductsList from '@functions/getProductsList'
import getProductsById from '@functions/getProductsById'
import createProduct from '@functions/createProduct'
import catalogBatchProcess from '@functions/catalogBatchProcess'
import { secrets } from './secrets'

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      ...secrets,
      SNS_REGION: 'eu-west-1',
      SNS_ARN: { Ref: 'SNSCatalogBatchProcessTopic' },
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: { Ref: 'SNSCatalogBatchProcessTopic' },
      },
    ],
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      SNSCatalogBatchProcessTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'rs-node-js-sns-catalog-batch-process-topic',
        },
      },
      SNSCatalogBatchProcessSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: secrets.EMAIL1,
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSCatalogBatchProcessTopic',
          },
          FilterPolicy: {
            productCount: [{ numeric: ['>=', 5] }],
          },
        },
      },
      SNSCatalogBatchProcessSubscription2: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: secrets.EMAIL2,
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSCatalogBatchProcessTopic',
          },
          FilterPolicy: {
            productCount: [{ numeric: ['<', 5] }],
          },
        },
      },
    },
    Outputs: {
      catalogItemsQueueArn: {
        Value: { 'Fn::GetAtt': ['catalogItemsQueue', 'Arn'] },
        Export: {
          Name: 'catalogItemsQueueArn',
        },
      },
      catalogItemsQueueURL: {
        Value: { Ref: 'catalogItemsQueue' },
        Export: {
          Name: 'catalogItemsQueueURL',
        },
      },
    },
  },
  // import the function via paths
  functions: {
    getProductsList,
    getProductsById,
    createProduct,
    catalogBatchProcess,
  },
}

module.exports = serverlessConfiguration
