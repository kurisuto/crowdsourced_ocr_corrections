import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { getAllLines } from '../../businessLogic/lines';



export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(event)

  const lines = await getAllLines()


  return {
    statusCode: 200,
    body: JSON.stringify({
      'lines': lines
    })
  }

})




handler
  .use(cors())
  .use(seanMiddy())


