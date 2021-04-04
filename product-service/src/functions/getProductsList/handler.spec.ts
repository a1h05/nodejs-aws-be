import { getProductsList } from './handler'
import productList from '../../mocks/productList.json'
import { mocked } from 'ts-jest/utils'
import { getProductListMockRequest } from '../../mocks/getProductsList'
import { APIGatewayProxyResult } from 'aws-lambda'

jest.mock('../../mocks/getProductsList')

describe('getProductsList', () => {
  it('should get products list', async () => {
    mocked(getProductListMockRequest).mockResolvedValue(productList)

    const result = (await getProductsList(
      undefined,
      undefined,
      undefined
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual(productList)
  })
  it('should return error response if request failed', async () => {
    mocked(getProductListMockRequest).mockRejectedValue(
      new Error('Database is not responding')
    )

    const result = (await getProductsList(
      undefined,
      undefined,
      undefined
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Sorry something went wrong',
    })
  })
})
