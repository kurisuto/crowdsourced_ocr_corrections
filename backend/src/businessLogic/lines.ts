import { DatabaseAccess } from '../dataLayer/databaseAccess'
const databaseAccess = new DatabaseAccess()

import { Line } from '../models/Line'


export async function getAllLines(): Promise<Line[]> {
  const lines = await databaseAccess.getAllLines()
  return lines
}


export async function getNextLineForEditing(userId: string): Promise<any> {
  const lines = await databaseAccess.getAllLines()
  console.log(userId)

  var line = lines[Math.floor(Math.random() * lines.length)];

  const bucket = process.env.S3_BUCKET_LINE_IMAGES
  const url = 'https://' + bucket + '.s3.amazonaws.com/' + line["imageKey"]
  
  var returnLine = {
    lineId: line["lineId"],
    rawText: line["rawText"],
    imageUrl: url
  }

  return returnLine
}



// This is for development purposes, to load mocked-up data
export async function loadFakeLines(lines): Promise<boolean> {

  for (var line of lines) {
    line['bookId'] = '1'
    await databaseAccess.createLine(line)
  }

  return true
}

