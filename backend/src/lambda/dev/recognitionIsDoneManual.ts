import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// import * as AWS from 'aws-sdk'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { recognitionIsDone } from '../../businessLogic/pages';


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  console.log(event)


  const jobId = event.pathParameters.jobId
  // const jobId = '1de72977d57f658e4e1aadf4300c7a1dd3e978e76b74774540291ad9538a6287'

  await recognitionIsDone(jobId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      'message': 'The function call is completed!!!'
    })
  }

})


handler
  .use(cors())
  .use(seanMiddy())


