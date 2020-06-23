import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { createLogger } from '../../utils/logger'
// import { getAllTodoItems } from '../../businessLogic/todos';

const logger = createLogger('todos')


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  // const todos = await getAllTodoItems(event.headers.userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: 'Shucks'
    })
  }

})


handler
  .use(cors())
  .use(seanMiddy())

