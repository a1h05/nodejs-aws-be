import {createClient} from "@commercetools/sdk-client";
import {createAuthMiddlewareForClientCredentialsFlow} from "@commercetools/sdk-middleware-auth";
import {createHttpMiddleware} from "@commercetools/sdk-middleware-http";
import fetch from "node-fetch";


export class CommercetoolsClientService {
  public execute(request: any) {
    return this.client.execute(request)
  }
  private readonly client: any;
  constructor() {
    const projectKey = process.env.CTP_PROJECT_KEY

    const authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
      host: process.env.CTP_AUTH_URL,
      projectKey,
      credentials: {
        clientId: process.env.CTP_CLIENT_ID,
        clientSecret: process.env.CTP_CLIENT_SECRET,
      },
      scopes: [process.env.CTP_SCOPES],
      fetch,
    })
    const httpMiddleware = createHttpMiddleware({
      host: process.env.CTP_API_URL,
      fetch,
    })
    this.client = createClient({
      middlewares: [authMiddleware, httpMiddleware],
    })
  }

}
