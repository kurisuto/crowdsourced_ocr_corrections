import 'source-map-support/register'
import { SNSEvent, SNSHandler } from 'aws-lambda'

import { startOcr } from '../../businessLogic/recognition';


export const handler: SNSHandler = async (event: SNSEvent) => {

  console.log('Processing SNS event ', JSON.stringify(event))

  for (const snsRecord of event.Records) {
    const key = snsRecord['s3']['object']['key']
    await startOcr('', key)
  }
}


