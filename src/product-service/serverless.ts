import type { AWS } from '@serverless/typescript'

import getProductsList from '@functions/getProductsList'
import getProductsById from '@functions/getProductsById'
import createProduct from '@functions/createProduct'
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
  },
  // import the function via paths
  functions: { getProductsList, getProductsById, createProduct },
}

module.exports = serverlessConfiguration
