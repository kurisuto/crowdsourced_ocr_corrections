import * as uuid from 'uuid'

import { createLogger } from '../utils/logger'
const logger = createLogger('ced')

import { Page } from '../models/Page'

// Data abstraction layer
import { DatabaseAccess } from '../dataLayer/databaseAccess'
import { getUploadUrl, writeOcrResultsToS3 } from '../dataLayer/s3Access'
import { submitOcr, fetchOcrResults } from '../dataLayer/textractAccess'

// Set up our access to the database
const databaseAccess = new DatabaseAccess()

// See edits.ts for comments on dummyBookId.
const dummyBookId = '1'



export async function generateUploadUrl(): Promise<string> {
  const imageId = uuid.v4()
  const uploadUrl = getUploadUrl(imageId)
  return uploadUrl
}



export async function getAllPages(): Promise<Page[]> {
  const bucket = process.env.S3_BUCKET_OCR_OUTPUT
  
  var pages = await databaseAccess.getAllPages()
  for (var page of pages) {
    var pageId = page["pageId"]
    var url = "https://" + bucket + ".s3.amazonaws.com/" + pageId + ".json"
    page["ocrOutputUrl"] = url
  }
  return pages
}



export async function startOcr(userId: string, imageFilename: string): Promise<boolean> {
  const pageId = uuid.v4()
  const ocrStartedAt = new Date().toISOString()

  // Start the asynchronous OCR process in Textract
  const jobId = await submitOcr(pageId, imageFilename)

  // Create a database entry about this new page
  const newPage = {
    bookId: dummyBookId,
    pageId,
    userId,
    imageFilename,
    status: 'performing_ocr',
    jobId,
    ocrStartedAt,
    ocrCompletedAt: ''
  }
  await databaseAccess.createPage(newPage)

  return true
}




export async function recognitionIsDone(jobId: string): Promise<any> {

  const bookId = dummyBookId
  const status = 'completed'
  const ocrCompletedAt = new Date().toISOString()

  logger.info('Fetching results for jobId ' + jobId)
  const ocrResults = await fetchOcrResults(jobId)

  // jobStatus can be FAILED, IN_PROGRESS, PARTIAL_SUCCESS, SUCCEEDED 
  // We'll treat IN_PROGESS as a failure.  It would be an anomaly
  // here, because this application fetches Textract results only
  // in response to an SNS event indicating that the OCR has completed.

  const jobStatus = ocrResults["JobStatus"]
  if ((jobStatus == 'FAILED') || (jobStatus == 'IN_PROGRESS')) {
     return "OCR job failed"
  }


  // If we are being called from an SNS event, then the JobTag
  // contains the pageId.  However, if we were called manually from an
  // http get (for development purposes), then we need to look up the
  // pageId based on the jobId.
  var pageId = ocrResults["JobTag"]
  if (typeof(pageId) == "undefined") {
    pageId = await databaseAccess.jobIdToPageId(jobId)
  }
  logger.info("Determined the following pageId correponding to this OCR job: " + pageId)



  logger.info('Writing results to s3')
  await writeOcrResultsToS3(pageId, ocrResults)

  logger.info('Updating page table')
  await databaseAccess.markPageAsCompleted(bookId, pageId, status, ocrCompletedAt)

  return true
}




/*

For future work:

There is technically a race condition in the code above, although it
is unlikely to be a practical problem in this case.

When a page image file is uploaded to the page image s3 bucket, it
kicks off the startOcr function above.  That function kicks off the
asynchronous OCR process in Textract, and then it creates a record in
the database about the new page.  We do the actions in that order,
because Textract gives us a jobId which we want to remember.

When Textract is done, it sends a second event to run the
recognitionIsDone function above.  That function retrieves the
recognized text and stores it in s3.  It also updates the database
record for this page to indicate that the recognition is done.

Although unlikely, the asynchronous Textract process could finish
before the first function has finished creating the page record in the
database.  If that situation arose, the second function would try to
update the record which hasn't been created yet.  (Our current code
for updating the database throws a 404 exception if it can't find a
record in our database corresponding to the completed job.)

I asked on the mentor Q&A board about this, and the suggetion was to
use SQS, although I haven't looked into it deeply enough to see how
that would address the problem.  I think we really need some kind of
semaphore or locking mechanism.

*/

