import 'source-map-support/register'
import { SNSEvent, SNSHandler } from 'aws-lambda'

// import * as AWS from 'aws-sdk'
// const sns = new AWS.SNS();

import { recognitionIsDone } from '../../businessLogic/recognition';


export const handler: SNSHandler = async (event: SNSEvent) => {

  console.log('Processing SNS event ', JSON.stringify(event))

  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)
    const jobId = s3Event['JobId']
    console.log(jobId)
    await recognitionIsDone(jobId)
  }

  // await sendMessage()

}


/*
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

*/


