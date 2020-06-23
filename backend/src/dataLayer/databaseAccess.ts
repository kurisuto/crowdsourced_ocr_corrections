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
    private readonly pageTable = process.env.TABLE_PAGE
    )
  {
  }


//    private readonly lineTable = process.env.TABLE_LINE,
//    private readonly editTable = process.env.TABLE_EDIT) {



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


  async getAllPages(): Promise<any> {

    const result = await this.docClient.scan({
      TableName: this.pageTable
    }).promise()

    return result.Items
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


