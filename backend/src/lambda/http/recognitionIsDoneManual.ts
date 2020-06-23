import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// import * as AWS from 'aws-sdk'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { recognitionIsDone } from '../../businessLogic/recognition';


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  console.log(event)

  const jobId = '85d8efa646774d55095ae469d1f3c2c371920f70433a7a5e3f08cc3d16c6d0fe'

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


