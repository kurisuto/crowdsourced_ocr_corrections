import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { createLogger } from '../../utils/logger'
import { getNextLineForEditing } from '../../businessLogic/lines';

const logger = createLogger('ced')


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  const line = await getNextLineForEditing(event.headers.userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: line
    })
  }

})


handler
  .use(cors())
  .use(seanMiddy())

