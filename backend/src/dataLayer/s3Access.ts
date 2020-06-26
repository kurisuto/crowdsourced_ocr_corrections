import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todos')

const pageUploadBucketName = process.env.S3_BUCKET_PAGE_UPLOAD
const ocrOutputBucketName = process.env.S3_BUCKET_OCR_OUTPUT

// const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export function getUploadUrl(imageId: string) {
  logger.info('Data access layer is calling s3 to get a signed URL for uploading a file.')
  
  return s3.getSignedUrl('putObject', {
    Bucket: pageUploadBucketName,
    Key: imageId,
    Expires: parseInt(urlExpiration)
  })
}


export async function writeOcrResultsToS3(pageId, ocrResults) {
  const jsonString = JSON.stringify(ocrResults)

  const filename = pageId + ".json"

  const request = {
      Bucket: ocrOutputBucketName,
      Key: filename,
      Body: jsonString,
      ContentType: 'application/json; charset=utf-8',
  }

  //    ACL: 'public-read',
  //    CacheControl: 'max-age=60'


  console.log(request)

  await new Promise((resolve, reject) => {
    s3.putObject(request, function(error, data) {
      if (error) {
        reject(error); 
      }
      else resolve(data);
    });
  });

  return true
}


