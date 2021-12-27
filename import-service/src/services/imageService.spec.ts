import { ImageService, ValidationError } from './imageService'
import AWS, { SQS } from 'aws-sdk'
import { mocked } from 'ts-jest/utils'
import { LoggerService } from './loggerService'
import { Readable, Transform } from 'stream'
import csv from 'csv-parser'
import { trimHeader } from '@libs/csv'

jest.mock('aws-sdk')
jest.mock('csv-parser')

describe('ImageService', () => {
  describe('parseFile', () => {
    const record1 = 'Imported title 1;Imported description 1;1;11'
    const record2 = 'Imported title 2;Imported description 2;2;22'
    const record3 = 'Imported title 3;Imported description 3;3;33'
    const csved = {
      [record1]: {
        title: 'Imported title 1',
        description: 'Imported description 1',
        price: 1,
        count: 11,
      },
      [record2]: {
        title: 'Imported title 2',
        description: 'Imported description 2',
        price: 2,
        count: 22,
      },
      [record3]: {
        title: 'Imported title 3',
        description: 'Imported description 3',
        price: 3,
        count: 33,
      },
    }
    const filename =
      '%25D0%259A%25D0%25BD%25D0%25B8%25D0%25B3%25D0%25B0%2520%25D0%25BB%25D0%25BE%25D0%25BB%25D0%25BE%25D0%25BB.csv'
    const decodedFilename =
      '%D0%9A%D0%BD%D0%B8%D0%B3%D0%B0%20%D0%BB%D0%BE%D0%BB%D0%BE%D0%BB.csv'
    const s3KeyObject = `uploadFolder/${filename}`
    const decodedS3KeyObject = `uploadFolder/${decodedFilename}`
    const bucketName = 'bucketName'
    const bucketRegion = 'bucketRegion'
    const uploadFolder = 'uploadFolder'
    const parsedFolder = 'parsedFolder'
    const sqsURL = 'sqsURL'
    const createCSVTransform = () =>
      new Transform({
        objectMode: true,
        transform(chunk, _2, callback) {
          callback(null, csved[chunk])
        },
      })

    const createReadableStream = () => () =>
      Readable.from([record1, record2, record3])

    const prepareMock = () => {
      const createReadStream = jest.fn(createReadableStream())
      const getObject = jest.fn(() => ({ createReadStream }))
      const copyObjectPromise = jest.fn(() => Promise.resolve())
      const copyObject = jest.fn(() => ({ promise: copyObjectPromise }))
      const deleteObjectPromise = jest.fn(() => Promise.resolve())
      const deleteObject = jest.fn(() => ({ promise: deleteObjectPromise }))
      mocked<any>(AWS.S3).mockImplementation(() => ({
        getObject,
        copyObject,
        deleteObject,
      }))
      mocked(csv).mockImplementation(createCSVTransform)
      const loggerService = ({
        log: jest.fn(),
      } as unknown) as LoggerService
      const sqs = ({
        sendMessage: jest.fn(),
      } as unknown) as SQS
      const callCallback = (_, b) => b()
      mocked(sqs.sendMessage).mockImplementation(callCallback as any)
      const imageService = new ImageService(
        bucketName,
        bucketRegion,
        uploadFolder,
        parsedFolder,
        loggerService,
        sqs,
        sqsURL
      )
      return {
        getObject,
        copyObjectPromise,
        copyObject,
        deleteObjectPromise,
        deleteObject,
        imageService,
        sqs,
        sqsURL,
        csv,
      }
    }

    it('should parse file and send records to queue', async () => {
      const { getObject, sqs, imageService, sqsURL, csv } = prepareMock()

      await imageService.parseFile(s3KeyObject)

      expect(csv).toHaveBeenCalledWith({
        separator: ';',
        mapHeaders: trimHeader,
      })
      expect(getObject).toHaveBeenCalledWith({
        Bucket: bucketName,
        Key: decodedS3KeyObject,
      })
      expect(mocked(sqs.sendMessage).mock.calls[0][0]).toEqual({
        MessageBody: JSON.stringify(csved[record1]),
        QueueUrl: sqsURL,
      })
      expect(mocked(sqs.sendMessage).mock.calls[1][0]).toEqual({
        MessageBody: JSON.stringify(csved[record2]),
        QueueUrl: sqsURL,
      })
      expect(mocked(sqs.sendMessage).mock.calls[2][0]).toEqual({
        MessageBody: JSON.stringify(csved[record3]),
        QueueUrl: sqsURL,
      })
    })

    it('should move file', async () => {
      const {
        copyObjectPromise,
        copyObject,
        deleteObjectPromise,
        deleteObject,
        imageService,
      } = prepareMock()

      await imageService.parseFile(s3KeyObject)

      expect(copyObjectPromise).toHaveBeenCalled()
      expect(deleteObjectPromise).toHaveBeenCalled()
      expect(copyObject).toHaveBeenCalledWith({
        Bucket: bucketName,
        CopySource: `${bucketName}/${s3KeyObject}`,
        Key: `${parsedFolder}/${decodedFilename}`,
      })
      expect(deleteObject).toHaveBeenCalledWith({
        Bucket: bucketName,
        Key: decodedS3KeyObject,
      })
    })
  })
  describe('createSignedURL', () => {
    const signedURL = 'signedURL'

    it('should throw validation error if passed parameter is not a string', async () => {
      const imageService = new ImageService(
        'bucketName',
        'bucketRegion',
        'bucketFolder',
        'parsedFolder',
        {} as LoggerService,
        {} as SQS,
        'sqsURL'
      )

      await expect(imageService.createSignedURL(null)).rejects.toEqual(
        new ValidationError()
      )
    })

    it('should throw validation error if passed parameter is less than 4 characters', async () => {
      const bucketName = 'bucketName'
      const bucketRegion = 'bucketRegion'
      const uploadFolder = 'uploadFolder'
      const imageService = new ImageService(
        bucketName,
        bucketRegion,
        uploadFolder,
        'parsedFolder',
        {} as LoggerService,
        {} as SQS,
        'sqsURL'
      )
      const fileName = 'fileName'
      const mockGetSignedUrlPromise = jest.fn()
      mockGetSignedUrlPromise.mockReturnValue(signedURL)
      mocked<any>(AWS.S3).mockImplementation(() => ({
        getSignedUrlPromise: mockGetSignedUrlPromise,
      }))

      const result = await imageService.createSignedURL(fileName)

      expect(result).toBe(signedURL)
      expect(mockGetSignedUrlPromise).toHaveBeenCalledWith('putObject', {
        Bucket: bucketName,
        Key: `${uploadFolder}/${fileName}`,
        Expires: 60,
        ContentType: 'text/csv',
      })
      expect(AWS.S3).toHaveBeenCalledWith({
        region: bucketRegion,
        signatureVersion: 'v4',
      })
    })
  })
})
