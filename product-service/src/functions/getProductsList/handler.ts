import 'source-map-support/register'

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway'
import { formatJSONResponse } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import { getProductListMockRequest } from '../../mocks/getProductsList'

export const getProductsList: ValidatedEventAPIGatewayProxyEvent<void> = async () => {
  try {
    return await formatJSONResponse(200, await getProductListMockRequest())
  } catch (e) {
    return await formatJSONResponse(500, {
      message: 'Sorry something went wrong',
    })
  }
}

export const main = middyfy(getProductsList)
