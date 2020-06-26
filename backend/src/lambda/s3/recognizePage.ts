import 'source-map-support/register'
import { SNSEvent, SNSHandler } from 'aws-lambda'
import { startOcr } from '../../businessLogic/pages';

import { createLogger } from '../../utils/logger'
const logger = createLogger('ced')

// When an image file is uploaded to our page upload s3 bucket,
// s3 sends an event to the following function.

export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info('Processing SNS event ', JSON.stringify(event))

  for (const snsRecord of event.Records) {
    const key = snsRecord['s3']['object']['key']
    await startOcr('', key)
  }
}


