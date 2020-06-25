import * as uuid from 'uuid'

import { DatabaseAccess } from '../dataLayer/databaseAccess'

const databaseAccess = new DatabaseAccess()


export async function getAllEdits(): Promise<any> {
  const edits = await databaseAccess.getAllEdits()
  return edits
}


export async function deleteEdit(userId: string, editId: string): Promise<boolean> {
  console.log(userId)
  const bookId = '1'
  await databaseAccess.deleteEdit(bookId, editId)
  return true
}


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
    correctedText
  }

  console.log(newEdit)

  await databaseAccess.createEdit(newEdit)

  return true
}

