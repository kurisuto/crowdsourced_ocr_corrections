import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
const logger = createLogger('ced')

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { getNextLineForEditing } from '../../businessLogic/lines';



export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  const line = await getNextLineForEditing(event.headers.userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      line
    })
  }

})


handler
  .use(cors())
  .use(seanMiddy())

