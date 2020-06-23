import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { getAllPages } from '../../businessLogic/recognition';



export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(event)

  const pages = await getAllPages()


  return {
    statusCode: 200,
    body: JSON.stringify({
      'pages': pages
    })
  }

})




handler
  .use(cors())
  .use(seanMiddy())


