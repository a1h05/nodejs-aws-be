import { ImportProductFileHandler } from '@functions/importProductsFile/importProductFileHandler'
import { ValidatedAPIGatewayProxyEvent } from '@libs/apiGateway'
import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda/trigger/api-gateway-proxy'
import { ImageService, ValidationError } from '../../services/imageService'
import { mocked } from 'ts-jest/utils'

describe('ImportProductFileHandler', () => {
  it('should create signer url and return it', async () => {
    const signedURL = 'signedURL'
    const fileName = 'blabla.csv'
    const imageService = ({
      createSignedURL: jest.fn(),
    } as unknown) as ImageService
    mocked(imageService.createSignedURL).mockResolvedValue(signedURL)
    const handler = new ImportProductFileHandler(imageService)
    const event = {
      queryStringParameters: {
        name: fileName,
      } as APIGatewayProxyEventQueryStringParameters,
    } as ValidatedAPIGatewayProxyEvent<void>

    const result = await handler.handleFileImport(event, null, null)

    expect(result).toEqual({
      statusCode: 201,
      body: JSON.stringify(signedURL),
    })
  })

  it('should return 400 code if validation url was thrown', async () => {
    const fileName = ''
    const imageService = ({
      createSignedURL: jest.fn(),
    } as unknown) as ImageService
    mocked(imageService.createSignedURL).mockRejectedValue(
      new ValidationError()
    )
    const handler = new ImportProductFileHandler(imageService)
    const event = {
      queryStringParameters: {
        name: fileName,
      } as APIGatewayProxyEventQueryStringParameters,
    } as ValidatedAPIGatewayProxyEvent<void>

    const result = await handler.handleFileImport(event, null, null)

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        message: 'please provide fileName',
      }),
    })
  })

  it('should rethrow any unexpected error', async () => {
    const fileName = ''
    const imageService = ({
      createSignedURL: jest.fn(),
    } as unknown) as ImageService
    const error = new Error('something bad happened')
    mocked(imageService.createSignedURL).mockRejectedValue(error)
    const handler = new ImportProductFileHandler(imageService)
    const event = {
      queryStringParameters: {
        name: fileName,
      } as APIGatewayProxyEventQueryStringParameters,
    } as ValidatedAPIGatewayProxyEvent<void>

    await expect(handler.handleFileImport(event, null, null)).rejects.toEqual(
      error
    )
  })
})
