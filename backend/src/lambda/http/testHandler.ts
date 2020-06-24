import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'


import { makeFakeEdit } from '../../businessLogic/corrections';



export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  console.log(event)
  console.log('This is the test handler.')

  await makeFakeEdit()

  return {
    statusCode: 200,
    body: JSON.stringify({
      'message': 'The function call is completed'
    })
  }

})






handler
  .use(cors())
  .use(seanMiddy())


