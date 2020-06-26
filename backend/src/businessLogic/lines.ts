import { createLogger } from '../utils/logger'
const logger = createLogger('ced')

import { Line } from '../models/Line'

import { DatabaseAccess } from '../dataLayer/databaseAccess'
const databaseAccess = new DatabaseAccess()




export async function getAllLines(): Promise<Line[]> {
  const lines = await databaseAccess.getAllLines()
  return lines
}

/*

Following is a stub implementation of the process to assign the next
line to a user.  In a full implementation, this decision-making
process would be very complicated.  It would involve the following:

-- We assign each line independently to at least two users.  If they
   don't agree, we assign it to a third user, and so on.  Also, we
   need to make sure that a user doesn't get assigned the same
   line twice.

-- We might occasionally throw in lines for which the correct answer
   is already known to rate the accuracy of individual users.  We
   might use this information to make sure that two weak users
   aren't assigned to the same line, for example.

The current stub implementation simply randomly selects a line from
the mocked-up data.

*/
export async function getNextLineForEditing(userId: string): Promise<any> {
  const lines = await databaseAccess.getAllLines()

  // For an actual implementation, we'd definitely need to
  // know who this user is, so we'll leave it in the function
  // arguments.  The following line just absorbs the unused
  // variable warning.
  logger.info("userId: ", userId)

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

