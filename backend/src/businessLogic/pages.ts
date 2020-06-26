import * as uuid from 'uuid'

// The models represent the format of items in the database
// import { Page } from '../models/Page'

// Data abstraction layer
import { DatabaseAccess } from '../dataLayer/databaseAccess'
import { getUploadUrl, writeOcrResultsToS3 } from '../dataLayer/s3Access'
import { submitOcr, fetchOcrResults } from '../dataLayer/textractAccess'


// The request interfaces define the form of data from the frontend
// import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'




// Set up our access to the database
const databaseAccess = new DatabaseAccess()



export async function generateUploadUrl(): Promise<string> {

  const imageId = uuid.v4()
  const uploadUrl = getUploadUrl(imageId)


  return uploadUrl
}



export async function getAllPages(): Promise<any> {

  const pages = await databaseAccess.getAllPages()

  return pages
}



export async function startOcr(userId: string, imageFilename: string): Promise<boolean> {
  const pageId = uuid.v4()
  const ocrStartedAt = new Date().toISOString()

  // TODO: Race condition if the OCR finishes before the database update is complete.

  const jobId = await submitOcr(pageId, imageFilename)

  const newPage = {
    bookId: '1',
    pageId,
    userId,
    imageFilename,
    status: 'performing_ocr',
    jobId,
    ocrStartedAt,
    ocrCompletedAt: ''
  }

  await databaseAccess.createPage(newPage)

  console.log(newPage)

  return true
}




export async function recognitionIsDone(jobId: string): Promise<any> {

  const bookId = '1'
  const status = 'completed'
  const ocrCompletedAt = new Date().toISOString()

  console.log('Fetching results for jobId ' + jobId)
  const ocrResults = await fetchOcrResults(jobId)

  // jobStatus can be FAILED, IN_PROGRESS, PARTIAL_SUCCESS, SUCCEEDED 
  // We'll treat IN_PROGESS as a failure.  It would be an anomaly
  // here, because this application fetches Textract results only
  // in response to an SNS event indicating that the OCR has completed.

  const jobStatus = ocrResults["JobStatus"]
  if ((jobStatus == 'FAILED') || (jobStatus == 'IN_PROGRESS')) {
     return "OCR job failed"
  }


  // If we are being called from an SNS event, then the JobTag contains the pageId.
  // However, if we were called manually from an http get (for development purposes),
  // then we need to look up the pageId based on the jobId.
  var pageId = ocrResults["JobTag"]
  if (typeof(pageId) == "undefined") {
    pageId = await databaseAccess.jobIdToPageId(jobId)
  }
  console.log(pageId)

  console.log('Writing results to s3')
  await writeOcrResultsToS3(pageId, ocrResults)

  console.log('Updating page table')

  await databaseAccess.markPageAsCompleted(bookId, pageId, status, ocrCompletedAt)

  // console.log(ocrResults)

  return true
}





