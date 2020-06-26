import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'
const logger = createLogger('ced')

import { Page } from '../models/Page'
import { Edit } from '../models/Edit'
import { Line } from '../models/Line'


export class DatabaseAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly pageTable = process.env.TABLE_PAGE,
    private readonly editTable = process.env.TABLE_EDIT,
    private readonly lineTable = process.env.TABLE_LINE
    )
  {
  }



  // ------------------------------------------------------------------
  // METHODS FOR THE PAGE TABLE


  async getAllPages(): Promise<Page[]> {

    const result = await this.docClient.scan({
      TableName: this.pageTable
    }).promise()

    return result.Items as Page[]
  }


  async createPage(newPage: Page): Promise<boolean> {
    logger.info('Database access layer is creating a page')

    await this.docClient
      .put({
        TableName: this.pageTable,
        Item: newPage
      })
      .promise()


    return true
  }


  async markPageAsCompleted(bookId: string, pageId: string, status: string, ocrCompletedAt: string): Promise<boolean> {


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

    if (!result.Item) {
      throw new Error("404 no_such_item")
    }

    return result.Item
  }





  // ------------------------------------------------------------------
  // METHODS FOR THE EDIT TABLE


  async createEdit(newEdit: Edit): Promise<boolean> {
    logger.info(newEdit)

    await this.docClient
      .put({
        TableName: this.editTable,
        Item: newEdit
      })
      .promise()


    return true     
  }



  async markEditAsRejected(bookId, editId): Promise<boolean> {

    var edit = this.fetchEdit(bookId, editId)

    edit['rejected'] = true

    await this.docClient
      .put({
        TableName: this.editTable,
        Item: edit
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


  async getAllEdits(): Promise<Edit[]> {

    const result = await this.docClient.scan({
      TableName: this.editTable
    }).promise()

    return result.Items as Edit[]
  }


  async editMustExist(bookId: string, editId: string): Promise<boolean> {

    const result = await this.docClient
      .get({
        TableName: this.editTable,
        Key: {
          editId: editId,
          bookId: bookId
        }
      })
      .promise()


    if (!result.Item) {
      throw new Error("404 no_such_item")
    }

    return true
  }


  async fetchEdit(bookId: string, editId: string): Promise<any> {

    const result = await this.docClient
      .get({
        TableName: this.editTable,
        Key: {
          bookId: bookId,
          editId: editId
        }
      })
      .promise()

    return result.Item
  }



  /*
  The following method does an inefficient scan.  The method is
  only for development purposes, so it's not worth setting up
  a separate index for this lookup.

  The way the fully-implemented app works is that Textract sends an
  SNS event to the recognitionIsDone Lambda function.  This event
  contains the pageId, so we don't normally have to look it up from
  the Textract jobId.

  For development purposes, though, we can also manually kick off
  recognitionIsDone with an http GET.  In that case, we don't know the
  pageId and have to look it up from the jobId.
  */
  async jobIdToPageId(jobId: string): Promise<any> {

    const result = await this.docClient.scan({
      TableName: this.pageTable
    }).promise()

    var pageId = "none"

    for (const item of result.Items) {
      if (item.jobId == jobId) {
        pageId = item.pageId
      }
    }

    if (pageId == "none") {
      throw new Error("404 no_such_item")
    }

    return pageId

  }



  // ------------------------------------------------------------------
  // METHODS FOR THE LINE TABLE


  async createLine(newLine: Line): Promise<boolean> {

    await this.docClient
      .put({
        TableName: this.lineTable,
        Item: newLine
      })
      .promise()


    return true     
  }


  async getAllLines(): Promise<Line[]> {

    const result = await this.docClient.scan({
      TableName: this.lineTable
    }).promise()

    return result.Items as Line[]
  }


  async lineMustExist(bookId: string, lineId: string): Promise<boolean> {

    const result = await this.docClient
      .get({
        TableName: this.lineTable,
        Key: {
          lineId: lineId,
          bookId: bookId
        }
      })
      .promise()


    if (!result.Item) {
      throw new Error("404 no_such_item")
    }

    return true
  }



}


// END OF CLASS DatabaseAccess
// ------------------------------------------------------------------



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


