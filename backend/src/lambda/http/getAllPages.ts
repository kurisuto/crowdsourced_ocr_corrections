import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
const logger = createLogger('ced')

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { getAllPages } from '../../businessLogic/pages';


/*
In a full implementation, we would paginate the results
from the database.  Since we'll do OCR only on a small
number of test pages, I've kept this simple for demonstration
purposes.
*/


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info(event)

  const pages = await getAllPages()

  return {
    statusCode: 200,
    body: JSON.stringify({
      'pages': pages
    })
  }

})


handler
  .use(cors())
  .use(seanMiddy())


