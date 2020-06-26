import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
const logger = createLogger('ced')

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { getNextLineForEditing } from '../../businessLogic/lines';
import { SubmitEditRequest } from '../../requests/SubmitEditRequest'
import { submitEdit } from '../../businessLogic/edits';



export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  // First submit the edit which the user just completed.
  const record: SubmitEditRequest = JSON.parse(event.body)
  await submitEdit(event.headers.userId, record)

  // Then send back the next line for the user to edit.
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


