import 'source-map-support/register'

import { middyfyHTTP } from '@libs/lambda'
import { ImageService } from '../../services/imageService'

import { ImportProductFileHandler } from './importProductFileHandler'
import { LoggerService } from '../../services/loggerService'

const loggerService = new LoggerService(console)
const imageService = new ImageService(
  process.env.BUCKET_NAME,
  process.env.BUCKET_REGION,
  process.env.UPLOAD_FOLDER,
  process.env.PARSED_FOLDER,
  loggerService
)
const handler = new ImportProductFileHandler(imageService)

export const main = middyfyHTTP({
  handler: handler.handleFileImport,
  loggerService,
})
