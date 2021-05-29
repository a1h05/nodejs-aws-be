import type { AWS } from '@serverless/typescript'

import importProductsFile from '@functions/importProductsFile'
import importFileParser from '@functions/importFileParser'

const serverlessConfiguration: AWS = {
  service: 'import-service',
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
      BUCKET_REGION: 'eu-west-1',
      BUCKET_NAME: 'rs-node-aws-import-service',
      UPLOAD_FOLDER: 'uploaded',
      PARSED_FOLDER: 'parsed',
      CATALOG_ITEMS_QUEUE_URL: '${cf:product-service-dev.catalogItemsQueueURL}'
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:ListBucket'],
        Resource: ['arn:aws:s3:::rs-node-aws-import-service'],
      },
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: ['arn:aws:s3:::rs-node-aws-import-service/*'],
      },
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: ['${cf:product-service-dev.catalogItemsQueueArn}'],
      },
    ],
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
}

module.exports = serverlessConfiguration
