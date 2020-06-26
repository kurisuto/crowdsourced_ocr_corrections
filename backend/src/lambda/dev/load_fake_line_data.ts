import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
const logger = createLogger('ced')

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'

import { loadFakeLines } from '../../businessLogic/lines';
import { fakeLineData } from './fake_line_data.ts';



export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info(event)

  const fakeLines = JSON.parse(fakeLineData)

  await loadFakeLines(fakeLines)

  return {
    statusCode: 200,
    body: JSON.stringify({
      'message': 'The seed data has been loaded to the database.'
    })
  }

})






handler
  .use(cors())
  .use(seanMiddy())


