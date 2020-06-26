import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { createLogger } from '../../utils/logger'
import { generateUploadUrl } from '../../businessLogic/pages';

const logger = createLogger('ced')




export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  const uploadUrl = await generateUploadUrl()

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
    })
  }

})


handler
  .use(cors())
  .use(seanMiddy())


