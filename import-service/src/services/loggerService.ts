import { Writable } from 'stream'

export class LoggerService {
  constructor(private console: Console) {}

  createLoggerStream = () => {
    return new Writable({
      objectMode: true,
      write: (chunk, _, callback) => {
        this.log(JSON.stringify(chunk))
        callback()
      },
    })
  }

  log = (...args) => {
    this.console.log(...args)
  }
}
