import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
const logger = createLogger('ced')

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { recognitionIsDone } from '../../businessLogic/pages';


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(event)

  const jobId = event.pathParameters.jobId

  await recognitionIsDone(jobId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      'message': 'The function call completed successfully.'
    })
  }

})


handler
  .use(cors())
  .use(seanMiddy())


