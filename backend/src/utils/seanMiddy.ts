
module.exports = { seanMiddy: () => ({

  // Essentially all of our API functions require that we extract a userId
  // from the JWT token found in the Authorization header.  We factor this
  // out into the middleware.  Our strategy is to save the extracted userId
  // as a field of the event.
  before: (handler, next) => {
    const AuthUtils = require('../auth/utils.ts')

    // This shouldn't happen, but catch the case where the Authorization
    // header is missing.
    const authHeader = handler.event.headers.Authorization
    if (typeof authHeader === 'undefined') {
      throw new Error("401 no_authorization_header")
    }

    // Extract the userId
    const split = authHeader.split(' ')
    const jwt_token = split[1]
    const userId = AuthUtils.parseUserId(jwt_token)

    handler.event.headers.userId = userId

    if (process.env.IS_OFFLINE) {
      console.log('Processing event: ', handler.event)
    }
    else {
      // logger.info(`Processing event ${JSON.stringify(handler.event)}`)
    }



    return next()
  },

  after: (handler, next) => {
    // @ts-ignore  We're not currently using the event, so suppress the warning
    const { event } = handler

    // We're not currently doing anything here in the after phase.
    // I'm leaving this exploratory code here as a record of how to
    // add headers to the response.
    /*
    if (handler.event.hasOwnProperty('httpMethod')) {
      handler.response = handler.response || {}
      handler.response.headers = handler.response.headers || {}
      handler.response.headers['Sean-Header'] = 'Really nice header value'
    }
    */

    return next()
  },


  // The following allows us to factor out a lot of error conditions.
  // If our application code throws an exception, we catch it here.
  // We indicate the type of the error with the Error.message field.
  // Normally we just return a 500 error code, but there are a few
  // special cases where we want to return something more informative.

  // Note that there is difference of opinion even among Udacity's
  // staff as to how much information we should expose here.  The
  // sample code for lesson 5 returns a 404 code if the frontend tries
  // to access an item which doesn't exist in the database.  However,
  // a mentor on the Q&A board suggested just returning 500 for everything
  // so that we're not revealing as much information to hackers; in that
  // case we have to rely on logging to provide more debugging clues.  I see
  // the point, but I'll opt for the more informative response for this
  // student exercise.

  onError: (handler, next) => {
    const Logger = require('./logger.ts')
    const logger = Logger.createLogger('todos')


    var statusCode = 500
    var message = 'An internal server error occurred.'

    if (handler.error.message.startsWith('401')) {
      statusCode = 401
      message = 'Not authorized.  The authorization token may be missing.'
    }

    if (handler.error.message.startsWith('404')) {
      statusCode = 404
      message = 'Not found.  Possibly, an invalid todoId was sent.'
    }

    handler.response = {
       statusCode: statusCode,
       body: JSON.stringify({
        message: message
      })
    }


    // The formatting is easier to read when running offline if we use
    // console.log().  However, we should use logger.info() in deployment
    // to write to CloudWatch.
    if (process.env.IS_OFFLINE) {
      console.log(handler.error)
    }
    else {
      logger.info('Error info: ' + handler.error.stack)
    }

    return next()
 }

})

}




