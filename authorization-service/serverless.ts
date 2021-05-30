import type { AWS } from '@serverless/typescript'

import basicAuthorizer from '@functions/basicAuthorizer'

const serverlessConfiguration: AWS = {
  service: 'authorization-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
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
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [],
  },
  resources: {
    Outputs: {
      authLambdaARN: {
        Value: { 'Fn::GetAtt': ['BasicAuthorizerLambdaFunction', 'Arn'] },
        Export: {
          Name: 'authLambdaARN',
        },
      },
    }
  },
  functions: { basicAuthorizer },
}

module.exports = serverlessConfiguration
