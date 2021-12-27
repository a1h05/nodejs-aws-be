Products service

You need to create "secrets.ts" with environmental variables.(I know it is better to put this to AWS secrets manager)

```
export const secrets = {
  CTP_PROJECT_KEY:"",
  CTP_CLIENT_SECRET:"",
  CTP_CLIENT_ID:"",
  CTP_AUTH_URL:"",
  CTP_API_URL:"",
  CTP_SCOPES:"",
}
```

serverless invoke local --function functionName
