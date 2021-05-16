import { S3Event } from 'aws-lambda/trigger/s3'
import { ImageService } from '../../services/imageService'
import { FileParseHandler } from '@functions/importFileParser/fileParseHandler'
import { mocked } from 'ts-jest/utils'

describe('FileParseHandler', () => {
  it('should handle parsing of passed s3 records', async () => {
    const key1 = 'key1'
    const key2 = 'key2'
    const event = {
      Records: [
        {
          s3: {
            object: {
              key: key1,
            },
          },
        },
        {
          s3: {
            object: {
              key: key2,
            },
          },
        },
      ],
    } as S3Event

    const imageService = ({
      parseFile: jest.fn(),
    } as unknown) as ImageService
    mocked(imageService.parseFile).mockResolvedValue()
    const handler = new FileParseHandler(imageService)

    const result = await handler.handleFileParsing(event, null, null)

    expect(result).toEqual({ statusCode: 200 })
    expect(imageService.parseFile).toHaveBeenCalledWith(key1)
    expect(imageService.parseFile).toHaveBeenCalledWith(key2)
  })
})
