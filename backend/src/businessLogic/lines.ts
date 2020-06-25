import { DatabaseAccess } from '../dataLayer/databaseAccess'

const databaseAccess = new DatabaseAccess()


export async function getAllLines(): Promise<any> {
  const lines = await databaseAccess.getAllLines()
  return lines
}


export async function loadFakeLines(lines): Promise<boolean> {

  for (var line of lines) {
    line['bookId'] = '1'
    // console.log(line)
    await databaseAccess.createLine(line)
  }

  return true
}

