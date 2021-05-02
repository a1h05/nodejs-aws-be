import { ImageService } from '../../services/imageService'
import { S3EventHandler } from '@libs/apiGateway'

export class FileParseHandler {
  constructor(private imageService: ImageService) {}

  handleFileParsing: S3EventHandler = async event => {
    for (const record of event.Records) {
      await this.imageService.parseFile(record.s3.object.key)
    }
    return {
      statusCode: 200,
    }
  }
}
