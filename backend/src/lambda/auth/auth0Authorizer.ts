import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'

import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('ced')


const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJJzYswUCdRtFAMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1oN3R6bnQ3dC5hdXRoMC5jb20wHhcNMjAwNjEwMTU0NjAzWhcNMzQw
MjE3MTU0NjAzWjAhMR8wHQYDVQQDExZkZXYtaDd0em50N3QuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlqZZgKd9KOfwcxn9TtUSgTrT
JSDAQ5jNsZaZPoLLf6UNrHva6TErd823ZTSZsRfU5jL8AuCAMPLgS/OR+0MX//SF
X8FzWT7YlPjuEFe3P4rF1/R6ThM6oE3XsXiuAlV2v3pffcvdm98sJ8gd8d/mglTb
32Tj0rT/+09NHMzCR6HOAv44D0YFXgmZDLCYJRiOwbkZHUNVPT/rj+r3HjmuHY+F
a36T6Wy7m9rsiEbDnDuIg6wh2RZUdFy2Yl+Oz7WkcQfrJVjHeZBf/wniQ6x3Qypz
4yp0HL2ItjY0JgG6H2AiawlKSpsBiqy8Wq8fuTq032SV/P4ItqfnJXw7x6RgeQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ9AQIsxGNIWtjMEFJv
zYlrtMhtnjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAIYC1gZQ
KRM7ngjjxV8MxxEd46n7G4e2JaiYUY2WLFbx21aQVXnBp0HREn8fWVwRex9Qukf8
RLBQawm8ZSXsH43Z6b8ORLRz81XBM1MaywGYMOuuxhnyatzf+K4UtBenlWhL/n2b
DEoXHLtBffZ4bllf7bXwgjSvAX3zwbqnVLtmE3kQv0ZFswpda23x/QFhMY1zK1by
NsYO+AEhJdvRBjk0DSMzLxvKhKNHHpG3omV7grcCTcnRjOF1Ap2ZCz0M2pxQdFIU
O80mIVBYCo2LvAMv03z0ky8qaI5Ipg3KYS4OzB/OXdm8wVgAQ/Ifvwx+oclGpWas
5UmF8t5tjF+JbyE=
-----END CERTIFICATE-----`



export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtPayload = verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtPayload)

    return {
      principalId: jwtPayload.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.info('User was not authorized ' + e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

