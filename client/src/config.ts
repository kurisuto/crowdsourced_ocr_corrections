// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'c0zbsbjdog'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`
// export const apiEndpoint = 'http://localhost:3003'


export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-h7tznt7t.auth0.com',            // Auth0 domain
  clientId: 'WO1G1GKuArFvqKQD3Te9k1iy9GlTMflm',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
