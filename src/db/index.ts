import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

export class DatabaseUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('Database connection unavailable')
    this.name = 'DatabaseUnavailableError'
    this.cause = cause
  }
}

export function getDb() {
  const url =
    process.env.PREVIEW_DATABASE_URL || process.env.NETLIFY_DATABASE_URL
  if (!url) {
    throw new DatabaseUnavailableError(
      new Error('No database URL set (checked PREVIEW_DATABASE_URL and NETLIFY_DATABASE_URL)'),
    )
  }
  const client = postgres(url, { max: 1 })
  return drizzle(client, { schema })
}

export type Db = ReturnType<typeof getDb>
export * from './schema'
