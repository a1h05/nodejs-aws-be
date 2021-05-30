export class LoggerService {
  constructor(private console: Console) {}

  log = (...args) => {
    this.console.log(...args)
  }
}
