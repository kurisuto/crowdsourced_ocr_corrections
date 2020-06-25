import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
// import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('coc')


export class DatabaseAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly pageTable = process.env.TABLE_PAGE,
    private readonly editTable = process.env.TABLE_EDIT
    )
  {
     //    private readonly lineTable = process.env.TABLE_LINE,
  }


  // ------------------------------------------------------------------
  // METHODS FOR THE PAGE TABLE


  async getAllPages(): Promise<any> {

    const result = await this.docClient.scan({
      TableName: this.pageTable
    }).promise()

    return result.Items
  }

  async createPage(newPage): Promise<boolean> {
    console.log(newPage)

    await this.docClient
      .put({
        TableName: this.pageTable,
        Item: newPage
      })
      .promise()


    return true
  }


  async markPageAsCompleted(bookId: string, pageId: string, status: string, ocrCompletedAt: string): Promise<boolean> {
    // console.log(newPage)

    var page = await this.fetchPage(bookId, pageId)

    page['status'] = status
    page['ocrCompletedAt'] = ocrCompletedAt

    await this.docClient
      .put({
        TableName: this.pageTable,
        Item: page
      })
      .promise()


    return true
  }


  async fetchPage(bookId: string, pageId: string): Promise<any> {

    const result = await this.docClient
      .get({
        TableName: this.pageTable,
        Key: {
          bookId: bookId,
          pageId: pageId
        }
      })
      .promise()

    return result.Item
  }



  async createEdit(newEdit): Promise<boolean> {
    console.log(newEdit)

    await this.docClient
      .put({
        TableName: this.editTable,
        Item: newEdit
      })
      .promise()


    return true     
  }


  async deleteEdit(bookId: string, editId: string): Promise<boolean> {

    await this.docClient
      .delete({
        TableName: this.editTable,
        Key: {
          bookId: bookId,
          editId: editId
        }
      })
      .promise()

    return true     
  }


  async getAllEdits(): Promise<any> {

    const result = await this.docClient.scan({
      TableName: this.editTable
    }).promise()

    return result.Items
  }




  /*

  The following function is not efficient at all.  It's just for code
  development purposes when there's only a small amount of data in the
  database.

  Under the normal flow, when a Textract job finished, it sends an SNS
  event containing a JobId which we can then use to retrieve the
  recognized text.  However, when we're running in an sls offline
  environment, we don't get that event, so we have to simulate it with
  a special HTTP GET which we use only for development purposes, not
  as part of the deployed app.  Since we don't get the Textract JobId...

  Does that mechanism actually work?  Need to check.

  */

  // This is not an efficient call, but it's only for development
  // purposes.  Normally, we send the pageId as the JobTag field when we
  // submit the Textract job, so we can just get it from the SNS event
  // under the normal flow.
  async jobIdToPageId(jobId: string): Promise<any> {

    const result = await this.docClient.scan({
      TableName: this.pageTable
    }).promise()

    var pageId

    for (const item of result.Items) {
      if (item.jobId == jobId) {
        pageId = item.pageId
      }

    }

    return pageId

  }





}


function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Data access layer is creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}


