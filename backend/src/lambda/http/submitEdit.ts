import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { createLogger } from '../../utils/logger'
import { submitEdit } from '../../businessLogic/edits';
import { SubmitEditRequest } from '../../requests/SubmitEditRequest'

const logger = createLogger('ced')


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  const record: SubmitEditRequest = JSON.parse(event.body)
  console.log(record)

  await submitEdit(event.headers.userId, record)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: 'Shucks'
    })
  }

})



handler
  .use(cors())
  .use(seanMiddy())


