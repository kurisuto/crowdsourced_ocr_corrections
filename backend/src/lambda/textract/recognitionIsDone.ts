import 'source-map-support/register'
import { SNSEvent, SNSHandler } from 'aws-lambda'
import { recognitionIsDone } from '../../businessLogic/pages';


// When an asynchronous Textract OCR job is completed, Textract
// sends an event to this function.

export const handler: SNSHandler = async (event: SNSEvent) => {

  console.log('Processing SNS event ', JSON.stringify(event))

  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    const s3Event = JSON.parse(s3EventStr)
    const jobId = s3Event['JobId']

    console.log('Extracting OCR results from Textract job with jobId: ', jobId)
    await recognitionIsDone(jobId)
  }


}


