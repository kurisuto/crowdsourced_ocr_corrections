import * as uuid from 'uuid'

import { Edit } from '../models/Edit'
import { SubmitEditRequest } from '../requests/SubmitEditRequest'

import { DatabaseAccess } from '../dataLayer/databaseAccess'
const databaseAccess = new DatabaseAccess()



export async function getAllEdits(): Promise<Edit[]> {
  const edits = await databaseAccess.getAllEdits()
  return edits
}


export async function submitEdit(userId: string, record: SubmitEditRequest): Promise<any> {

  const bookId = '1'
  const lineId = record['lineId']
  const editId = uuid.v4()
  const submittedAt = new Date().toISOString()


  await databaseAccess.lineMustExist(bookId, lineId)


  const newEdit = {
    bookId: '1',
    editId,
    lineId,
    userId,
    submittedAt,
    correctedText: record['correctedText'],
    rejected: false
  }

  await databaseAccess.createEdit(newEdit)

  return true
}


export async function markEditAsRejected(editId: string): Promise<boolean> {
  const bookId = '1'
  await databaseAccess.editMustExist(bookId, editId)
  await databaseAccess.markEditAsRejected(bookId, editId)
  return true
}



export async function deleteEdit(editId: string): Promise<boolean> {
  const bookId = '1'
  await databaseAccess.editMustExist(bookId, editId)
  await databaseAccess.deleteEdit(bookId, editId)
  return true
}


// This exists for development purposes.
export async function makeFakeEdit(): Promise<boolean> {

  const editId = uuid.v4()
  const lineId = uuid.v4()
  const userId = uuid.v4()
  const submittedAt = new Date().toISOString()
  const correctedText = 'but the Tin Woodman did not believe'

  const newEdit = {
    bookId: '1',
    editId,
    lineId,
    userId,
    submittedAt,
    correctedText,
    rejected: false
  }

  await databaseAccess.createEdit(newEdit)

  return true
}

