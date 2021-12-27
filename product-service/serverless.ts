import type { AWS } from '@serverless/typescript'

import getProductsList from '@functions/getProductsList'
import getProductsById from '@functions/getProductsById'
import deleteProduct from '@functions/deleteProduct'
import createProduct from '@functions/createProduct'
import catalogBatchProcess from '@functions/catalogBatchProcess'
import placeOrder from '@functions/placeOrder'
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
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [],
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
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
    deleteProduct,
    catalogBatchProcess,
    placeOrder
  },
}

module.exports = serverlessConfiguration
