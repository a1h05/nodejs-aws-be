import { handlerPath } from '@libs/handlerResolver'
import type {AWS} from "@serverless/typescript";

const configuration: AWS['functions'][''] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
}

export default configuration
