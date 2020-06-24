import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { createLogger } from '../../utils/logger'
import { deleteEdit } from '../../businessLogic/corrections';

const logger = createLogger('todos')


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  const editId = event.pathParameters.editId

  await deleteEdit(event.headers.userId, editId)

  return {
    statusCode: 200,
    body: JSON.stringify({})
  }

})

handler
  .use(cors())
  .use(seanMiddy())

