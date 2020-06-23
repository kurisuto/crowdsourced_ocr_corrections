import 'source-map-support/register'
import { SNSEvent, SNSHandler } from 'aws-lambda'

// import { startOcr } from '../../businessLogic/recognition';



export const handler: SNSHandler = async (event: SNSEvent) => {

  console.log('Processing SNS event ', JSON.stringify(event))

  // await sendMessage()

}


/*
export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  console.log(event)

  const imageFilename = 'wizard_of_oz_179.jpg'

  await startOcr(event.headers.userId, imageFilename)

  return {
    statusCode: 200,
    body: JSON.stringify({
      'message': 'The function call is completed'
    })
  }

})

*/



