import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { createLogger } from '../../utils/logger'
import { submitEdit } from '../../businessLogic/edits';
// import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const logger = createLogger('ced')


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing event ${JSON.stringify(event)}`)

  // const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // const newItem = await createTodoItem(event.headers.userId, newTodo)

  const record = JSON.parse(event.body)
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


