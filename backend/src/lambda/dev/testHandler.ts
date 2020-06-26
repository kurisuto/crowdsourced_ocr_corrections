import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
const logger = createLogger('ced')

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'




export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(event)


  // Insert code here for whatever temporary development purpose we
  // need.

  return {
    statusCode: 200,
    body: JSON.stringify({
      'message': 'The function call is completed'
    })
  }

})



handler
  .use(cors())
  .use(seanMiddy())


