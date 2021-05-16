import AWS from 'aws-sdk'
import { pipeline } from 'stream'
import csv from 'csv-parser'
import { LoggerService } from './loggerService'
import { promisify } from 'util'

const promisifiedPipeline = promisify(pipeline)

export class ValidationError extends Error {}

export class ImageService {
  constructor(
    private bucketName: string,
    private bucketRegion: string,
    private uploadFolder: string,
    private parsedFolder: string,
    private loggerService: LoggerService
  ) {}
  async parseFile(s3ObjectKey: string): Promise<void> {
    this.loggerService.log(`parseFile was invoked with ${s3ObjectKey}`)
    await this.parseAndLogCSV(s3ObjectKey)
    this.loggerService.log('parseAndLogCSV was executed')
    await this.moveParsedFile(s3ObjectKey)
  }

  private async moveParsedFile(s3ObjectKey: string) {
    this.loggerService.log('started moving file')
    const copySource = `${this.bucketName}/${s3ObjectKey}`
    const destination = ImageService.getDecodedKey(s3ObjectKey).replace(
      this.uploadFolder,
      this.parsedFolder
    )
    await this.getS3()
      .copyObject({
        Bucket: this.bucketName,
        CopySource: copySource,
        Key: destination,
      })
      .promise()

    this.loggerService.log(
      `file was moved from ${copySource} to ${destination}`
    )

    const deleteKey = ImageService.getDecodedKey(s3ObjectKey)

    await this.getS3()
      .deleteObject({
        Bucket: this.bucketName,
        Key: deleteKey,
      })
      .promise()

    this.loggerService.log(`${deleteKey} was deleted`)
  }

  private async parseAndLogCSV(s3ObjectKey: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: ImageService.getDecodedKey(s3ObjectKey),
    }
    this.loggerService.log(`trying to parse and log ${JSON.stringify(params)}`)
    const s3Stream = this.getS3().getObject(params).createReadStream()
    const csvStream = csv()
    const loggerStream = this.loggerService.createLoggerStream()
    await promisifiedPipeline(s3Stream, csvStream, loggerStream)
  }

  private static getDecodedKey(s3ObjectKey: string) {
    return decodeURIComponent(s3ObjectKey.replace(/\+/g, ' '))
  }

  async createSignedURL(csvFileName: string): Promise<string> {
    if (typeof csvFileName !== 'string' || csvFileName.length < 4) {
      throw new ValidationError()
    }

    const params = {
      Bucket: this.bucketName,
      Key: `${this.uploadFolder}/${csvFileName}`,
      Expires: 60,
      ContentType: 'text/csv',
    }

    return await this.getS3().getSignedUrlPromise('putObject', params)
  }

  private getS3() {
    return new AWS.S3({ region: this.bucketRegion, signatureVersion: 'v4' })
  }
}
