import { getProductsById } from './handler'
import productList from '../../mocks/productList.json'
import { mocked } from 'ts-jest/utils'
import { getProductListMockRequest } from '../../mocks/getProductsList'
import {
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
} from 'aws-lambda'
import { ValidatedAPIGatewayProxyEvent } from '@libs/apiGateway'

jest.mock('../../mocks/getProductsList')

describe('getProductsList', () => {
  it('should get products item by id', async () => {
    mocked(getProductListMockRequest).mockResolvedValue(productList)
    const event = {
      pathParameters: {
        productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
      } as APIGatewayProxyEventQueryStringParameters,
    } as ValidatedAPIGatewayProxyEvent<void>

    const result = (await getProductsById(
      event,
      undefined,
      undefined
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual(productList[0])
  })

  it('should raise not found error', async () => {
    mocked(getProductListMockRequest).mockResolvedValue(productList)
    const event = {
      pathParameters: {
        productId: '7567ec4b-b10c-48c5-9345-fc73c48a80ab',
      } as APIGatewayProxyEventQueryStringParameters,
    } as ValidatedAPIGatewayProxyEvent<void>

    const result = (await getProductsById(
      event,
      undefined,
      undefined
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(404)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Product was not found',
    })
  })
  it('should raise validation error', async () => {
    mocked(getProductListMockRequest).mockResolvedValue(productList)
    const event = {
      pathParameters: {
        productId: '333',
      } as APIGatewayProxyEventQueryStringParameters,
    } as ValidatedAPIGatewayProxyEvent<void>

    const result = (await getProductsById(
      event,
      undefined,
      undefined
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Invalid ID was provided',
    })
  })
  it('should raise internal server error', async () => {
    mocked(getProductListMockRequest).mockRejectedValue(
      new Error('database have not responded')
    )
    const event = {
      pathParameters: {
        productId: '7567ec4b-b10c-48c5-9345-fc73c48a80ab',
      } as APIGatewayProxyEventQueryStringParameters,
    } as ValidatedAPIGatewayProxyEvent<void>

    const result = (await getProductsById(
      event,
      undefined,
      undefined
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Sorry something went wrong',
    })
  })
})
