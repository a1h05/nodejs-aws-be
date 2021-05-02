import 'source-map-support/register'

import { middyfyS3 } from '@libs/lambda'
import { ImageService } from '../../services/imageService'

import { FileParseHandler } from './fileParseHandler'
import { LoggerService } from '../../services/loggerService'

const loggerService = new LoggerService(console)
const imageService = new ImageService(
  process.env.BUCKET_NAME,
  process.env.BUCKET_REGION,
  process.env.UPLOAD_FOLDER,
  process.env.PARSED_FOLDER,
  loggerService
)
const handler = new FileParseHandler(imageService)

export const main = middyfyS3({
  handler: handler.handleFileParsing,
  loggerService,
})
