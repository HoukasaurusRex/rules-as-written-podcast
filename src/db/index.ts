import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export class DatabaseUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('Database connection unavailable')
    this.name = 'DatabaseUnavailableError'
    this.cause = cause
  }
}

export function getDb() {
  const url = process.env.NETLIFY_DATABASE_URL
  if (!url) {
    throw new DatabaseUnavailableError(
      new Error('NETLIFY_DATABASE_URL is not set'),
    )
  }
  const sql = neon(url)
  return drizzle(sql, { schema })
}

export type Db = ReturnType<typeof getDb>
export * from './schema'
