import 'source-map-support/register'

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway'
import { formatJSONResponse } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import { getProductListMockRequest } from '../../mocks/getProductsList'

class ValidationError extends Error {}
class NotFoundError extends Error {}

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<void> = async event => {
  try {
    const UUIDRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!UUIDRegExp.test(event.pathParameters.productId)) {
      throw new ValidationError()
    }

    const productList = await getProductListMockRequest()

    const product = productList.find(
      ({ id }) => id === event.pathParameters.productId
    )
    if (!product) {
      throw new NotFoundError()
    }

    return await formatJSONResponse(200, product)
  } catch (e) {
    if (e instanceof ValidationError) {
      return await formatJSONResponse(400, {
        message: 'Invalid ID was provided',
      })
    }
    if (e instanceof NotFoundError) {
      return formatJSONResponse(404, { message: 'Product was not found' })
    }
    return await formatJSONResponse(500, {
      message: 'Sorry something went wrong',
    })
  }
}

export const main = middyfy(getProductsById)
