import { DatabaseAccess } from '../dataLayer/databaseAccess'

const databaseAccess = new DatabaseAccess()


export async function getAllLines(): Promise<any> {
  const lines = await databaseAccess.getAllLines()
  return lines
}


export async function getNextLineForEditing(userId: string): Promise<any> {
  const lines = await databaseAccess.getAllLines()

  var line = lines[Math.floor(Math.random() * lines.length)];

  const bucket = process.env.S3_BUCKET_LINE_IMAGES
  const url = 'https://' + bucket + '.s3.amazonaws.com/' + line["imageKey"]
  
  // https://coc-page-upload-424780530116-dev.s3.amazonaws.com/b4c53c5a-eb5e-4eec-8822-6ed2b5d89a4b



  var returnLine = {
    lineId: line["lineId"],
    rawText: line["rawText"],
    imageUrl: url
  }

  return returnLine
}



export async function loadFakeLines(lines): Promise<boolean> {

  for (var line of lines) {
    line['bookId'] = '1'
    // console.log(line)
    await databaseAccess.createLine(line)
  }

  return true
}

