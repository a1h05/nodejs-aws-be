import {Controller, All, Req, HttpException, HttpStatus, Logger, HttpService} from '@nestjs/common';
import { Request } from 'express';
import {ConfigService} from "@nestjs/config";
import {AxiosRequestConfig, Method} from "axios";
import {catchError, map, tap} from "rxjs/operators";

@Controller('*')
export class AppController {
  constructor(private configService: ConfigService, private httpService: HttpService) {}

  private readonly logger = new Logger()

  @All()
  getHello(@Req() req: Request): any {
    this.logger.log('originalUrl', req.originalUrl)
    this.logger.log('method', req.method)
    this.logger.log('body', req.body)

    const recipient = req.originalUrl.split('/')[1]
    this.logger.log('recipient', recipient)

    const requestUrl = req.originalUrl.split('/').slice(2).join('/')
    this.logger.log('recipient', recipient)

    const recipientURL = this.configService.get<string>(recipient)
    this.logger.log('recipientURL', recipientURL)

    if (!recipientURL) {
      throw new HttpException('Please specify correct recipient', HttpStatus.BAD_GATEWAY);
    }

    const axiosConfig: AxiosRequestConfig = {
      method: req.method as Method,
      url: `${recipientURL}/${requestUrl}`,
      ...(Object.keys(req.body || {}).length > 0 && {data: req.body})
    }
    console.log('axiosConfig', axiosConfig)

    return this.httpService.request(axiosConfig)
        .pipe(
            map(response => response.data),
            tap((response) => {
              this.logger.log('got response from recipient', response)
            }),
            catchError((err) => {
              if (!err.response) {
                throw err
              }

              const {status, data} = err.response
              throw new HttpException(data, status)
            })
        )
  }
}
