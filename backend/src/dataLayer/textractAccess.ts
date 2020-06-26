import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('ced')

const imageUploadBucketName = process.env.S3_BUCKET_PAGE_UPLOAD

//const textractSnsRoleArn = 'arn:aws:iam::424780530116:role/TempAdminRole'
// const textractSnsArn = 'arn:aws:sns:us-east-1:424780530116:textractDoneTopic-dev'
// arn:aws:sns:us-east-1:424780530116:COC-TextractDoneTopic-dev

const textractSnsRoleArn = process.env.TEXTRACT_DONE_ROLE_ARN
const textractSnsArn = process.env.TEXTRACT_DONE_TOPIC_ARN


const textract = new XAWS.Textract({
  signatureVersion: 'v4'
})


export async function submitOcr(pageId: string, imageFilename: string): Promise<string> {
  logger.info('Data access layer is submitting an OCR job.')

  var params = {
    DocumentLocation: {
      S3Object: {
        Bucket: imageUploadBucketName,
        Name: imageFilename
      }
    },
    JobTag: pageId,
    FeatureTypes: [
      'TABLES','FORMS'
    ],
    NotificationChannel: {
      RoleArn: textractSnsRoleArn,
      SNSTopicArn: textractSnsArn
    }
  }

  console.log(params)

  let textractOutput = await new Promise((resolve, reject) => {
    textract.startDocumentAnalysis(params, function(err, data) {
      if (err) reject(err); 
      else resolve(data);
    });
  });

  return textractOutput['JobId']

}


export async function fetchOcrResults(jobId: string): Promise<any> {

  const params = {
    JobId: jobId
  };

  let textractOutput = await new Promise((resolve, reject) => {
    textract.getDocumentAnalysis(params, function(err, data) {
      if (err) reject(err); 
      else resolve(data);
    });
  });


  return textractOutput
}

