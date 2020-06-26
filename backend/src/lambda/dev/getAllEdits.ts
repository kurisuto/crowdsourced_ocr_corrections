import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { getAllEdits } from '../../businessLogic/edits';



export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(event)

  const edits = await getAllEdits()


  return {
    statusCode: 200,
    body: JSON.stringify({
      'edits': edits
    })
  }

})




handler
  .use(cors())
  .use(seanMiddy())


