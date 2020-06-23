import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'


import * as AWS from 'aws-sdk'
AWS.config.region = 'us-east-1'

const s3 = new AWS.S3()
const sns = new AWS.SNS()
const textract = new AWS.Textract()




const dummyData = {
  DocumentMetadata: { Pages: 1 },
  JobStatus: 'SUCCEEDED',
  Blocks: [
    {
      BlockType: 'PAGE',
      Id: '588d0721-6796-4b0b-9f20-592eef157a1f',
      Page: 1
    },
    {
      BlockType: 'LINE',
      Confidence: 99.4490737915039,
      Text: 'THE DISCOVERY OF OZ, THE TERRIBLE 179',
      Id: 'bb3af435-3275-45ff-9148-78b43fada247',
      Page: 1
    },
    {
      BlockType: 'LINE',
      Confidence: 98.5854721069336,
      Text: 'Emerald City, and to make the name fit better I put green',
      Id: '5c8a204c-b5d6-49e0-b80d-5e35a0e86ff3',
      Page: 1
    },
    {
      BlockType: 'LINE',
      Confidence: 96.9310302734375,
      Text: 'spectacles on all the people, SO that everything they saw',
      Id: 'ca8d7fec-abe2-4cae-987a-3bf83267bcfc',
      Page: 1
    },
    {
      BlockType: 'LINE',
      Confidence: 95.63986206054688,
      Text: 'was green."',
      Id: 'ce5eb4fb-2500-4e4a-9b86-e85be69da2e7',
      Page: 1
    },
    {
      BlockType: 'LINE',
      Confidence: 96.7557373046875,
      Text: `"But isn't everything here green?" asked Dorothy.`,
      Id: 'af86410f-29d6-49b0-a611-c137a1c90e66',
      Page: 1
    },
    {
      BlockType: 'LINE',
      Confidence: 96.25874328613281,
      Text: '"No more than in any other city," replied Oz; "but',
      Id: 'a49159a4-8b18-4766-a34e-a6a03713a8d5',
      Page: 1
    },
    {
      BlockType: 'LINE',
      Confidence: 98.63760375976562,
      Text: 'when you wear green spectacles, why of course everything',
      Id: 'fe2ba093-60e7-4903-8ab7-5bd3a9f21962',
      Page: 1
    }
  ]
}
    



export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  console.log(event)
  // console.log(dummyData)

  console.log('This is the test handler.')

  if (false) {
    await sendMessage()
  }

  if (false) {
    await retrieveAnalysis()
  }

  if (false) {
    await writeJson()
  }






  return {
    statusCode: 200,
    body: JSON.stringify({
      'message': 'The function call is completed'
    })
  }

})



async function writeJson() {

  const imagesBucketName = process.env.S3_BUCKET_OCR_OUTPUT

  const jsonString = JSON.stringify(dummyData)

  const request = {
      Bucket: imagesBucketName,
      Key: 'output.txt',
      Body: jsonString,
      ContentType: 'application/json; charset=utf-8',
      ACL: 'public-read',
      CacheControl: 'max-age=60'
  }

  s3.putObject(request, (error, data) => {
    if (error) {
      console.log(error)
    }
    else {
      console.log(data)
    }
  })
  

//  await jsonWriter(JobID, bucket, key, textResult);


}



async function retrieveAnalysis() {

  var params = {
    JobId: 'ff43cadc83a385b68cac2e3078f73b8074efbcae85804345c9982f45ea816745'
  };
  textract.getDocumentAnalysis(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });


}




async function sendMessage() {

  const createdAt = new Date().toISOString()
  const message = 'This notification was generated at ' + createdAt

  var params = {
    Message: message, 
    Subject: 'The OCR is now completed',
    TopicArn: 'arn:aws:sns:us-east-1:424780530116:tornado_warning'
  };


  await sns.publish(params).promise()


}




handler
  .use(cors())
  .use(seanMiddy())

