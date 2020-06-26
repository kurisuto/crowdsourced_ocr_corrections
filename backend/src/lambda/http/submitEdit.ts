import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { createLogger } from '../../utils/logger'
const logger = createLogger('ced')

import { submitEdit } from '../../businessLogic/edits';
import { getNextLineForEditing } from '../../businessLogic/lines';
import { SubmitEditRequest } from '../../requests/SubmitEditRequest'



export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  const record: SubmitEditRequest = JSON.parse(event.body)
  logger.info(record)

  await submitEdit(event.headers.userId, record)

  const line = await getNextLineForEditing(event.headers.userId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      line
    })
  }

})



handler
  .use(cors())
  .use(seanMiddy())


