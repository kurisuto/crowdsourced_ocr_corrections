import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { createLogger } from '../../utils/logger'
// import { createTodoItem } from '../../businessLogic/todos';
// import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const logger = createLogger('todos')


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  // const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // const newItem = await createTodoItem(event.headers.userId, newTodo)

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


