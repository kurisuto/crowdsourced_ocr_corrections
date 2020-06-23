import 'source-map-support/register'
import { SNSEvent, SNSHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const sns = new AWS.SNS();



export const handler: SNSHandler = async (event: SNSEvent) => {

  console.log('Processing SNS event ', JSON.stringify(event))

  await sendMessage()

}



async function sendMessage() {

  const createdAt = new Date().toISOString()
  const message = 'This notification was generated at ' + createdAt

  var params = {
    Message: message, 
    Subject: 'The OCR is completed',
    TopicArn: 'arn:aws:sns:us-east-1:424780530116:tornado_warning'
  };

  await sns.publish(params).promise()

}


