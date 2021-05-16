import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/apiGateway'
import {
  ImageService,
  ValidationError,
} from '../../services/imageService'

export class ImportProductFileHandler {
  constructor(private imageService: ImageService) {}

  handleFileImport: ValidatedEventAPIGatewayProxyEvent<void> = async event => {
    try {
      const csvFileName = event.queryStringParameters.name

      const signedURL = await this.imageService.createSignedURL(csvFileName)

      return formatJSONResponse(201, signedURL)
    } catch (e) {
      if (e instanceof ValidationError) {
        return formatJSONResponse(400, {
          message: 'please provide fileName',
        })
      }
      throw e
    }
  }
}
