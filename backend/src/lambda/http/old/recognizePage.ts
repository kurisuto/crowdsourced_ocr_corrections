import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// @ts-ignore
import { seanMiddy } from '../../utils/seanMiddy'


import * as AWS from 'aws-sdk'
AWS.config.region = 'us-east-1'
const textract = new AWS.Textract()


const textractSnsRoleArn = 'arn:aws:iam::424780530116:role/TempAdminRole'
const textractSnsArn = 'arn:aws:sns:us-east-1:424780530116:textractDoneTopic-dev'


export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  console.log(event)

  var params = {
    DocumentLocation: {
      S3Object: {
        Bucket: 'coc-page-upload-424780530116-dev',
        Name: 'wizard_of_oz_179.jpg'
      }
    },
    FeatureTypes: [
      'TABLES','FORMS'
    ],
    NotificationChannel: {
      RoleArn: textractSnsRoleArn,
      SNSTopicArn: textractSnsArn
    }
  };


  let textractOutput = await new Promise((resolve, reject) => {
    textract.startDocumentAnalysis(params, function(err, data) {
      if (err) reject(err); 
      else resolve(data);
    });
  });

  const jobId = textractOutput['JobId']
  console.log(jobId)




/*
  var params = {
    JobId: 'ff43cadc83a385b68cac2e3078f73b8074efbcae85804345c9982f45ea816745'
  };
  textract.getDocumentAnalysis(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
*/





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

