import { PrismaClient } from '@prisma/client'
import { URL } from 'url'
import { env } from 'process'

export interface Context {
  prisma: PrismaClient
}

const regionalDB = new URL(env.DATABASE_URL as string)
const primaryDbUrl = env.DATABASE_URL

let connectionUrl = primaryDbUrl as string

if (env.PRIMARY_REGION !== env.FLY_REGION) {
  regionalDB.host = `${env.FLY_REGION}.${regionalDB.host}`
  regionalDB.port = '5433'
  connectionUrl = regionalDB.toString()
}

const prisma = new PrismaClient({
  log: [
    {level: 'error', emit: 'stdout'},
    {level: 'info', emit: 'stdout'},
    {level: 'warn', emit: 'stdout'},
  ],
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
})

console.log(`Connecting to database ${connectionUrl}`)

export const context: Context = {
  prisma: prisma,
}
