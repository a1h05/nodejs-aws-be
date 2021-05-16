import { ImageService, ValidationError } from './imageService'
import AWS from 'aws-sdk'
import { mocked } from 'ts-jest/utils'
import { LoggerService } from './loggerService'
import { Readable, Transform, Writable } from 'stream'
import csv from 'csv-parser'

jest.mock('aws-sdk')
jest.mock('csv-parser')

describe('ImageService', () => {
  describe('parseFile', () => {
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
    const createCSVTransform = () =>
      new Transform({
        objectMode: true,
        transform(chunk, _2, callback) {
          callback(null, chunk + 'csved')
        },
      })

    const createReadableStream = () => () =>
      Readable.from(['line1', 'line2', 'line3'])

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
      const loggedData = []
      const loggerService = ({
        log: jest.fn(),
        createLoggerStream: jest.fn(
          () =>
            new Writable({
              write(chunk: any, _, callback: (error?: Error | null) => void) {
                loggedData.push(chunk.toString())
                callback()
              },
            })
        ),
      } as unknown) as LoggerService
      const imageService = new ImageService(
        bucketName,
        bucketRegion,
        uploadFolder,
        parsedFolder,
        loggerService
      )
      return {
        getObject,
        copyObjectPromise,
        copyObject,
        deleteObjectPromise,
        deleteObject,
        loggedData,
        imageService,
      }
    }

    it('should parse file and log data', async () => {
      const { getObject, loggedData, imageService } = prepareMock()

      await imageService.parseFile(s3KeyObject)

      expect(getObject).toHaveBeenCalledWith({
        Bucket: bucketName,
        Key: decodedS3KeyObject,
      })
      expect(loggedData).toEqual(['line1csved', 'line2csved', 'line3csved'])
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
        {} as LoggerService
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
        {} as LoggerService
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
