import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { createLogger } from '../../utils/logger'
// import { updateTodoItem } from '../../businessLogic/todos';
// import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const logger = createLogger('todos')


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  // const todoId = event.pathParameters.todoId
  // const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // @ts-ignore  We're not currently using updateItem, which is the todoItem we just updated; but it's likely we might want it in the future.
  // const updatedItem = await updateTodoItem(event.headers.userId, todoId, updatedTodo)

  return {
    statusCode: 200,
    body: JSON.stringify({})
  }


})

handler
  .use(cors())
  .use(seanMiddy())


