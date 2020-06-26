import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
const logger = createLogger('ced')

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { startOcr } from '../../businessLogic/pages';


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(event)

  const key = event.pathParameters.key

  await startOcr(event.headers.userId, key)

  return {
    statusCode: 200,
    body: JSON.stringify({
      'message': 'The OCR job has been submitted to Textract.'
    })
  }

})


handler
  .use(cors())
  .use(seanMiddy())

