import { neon } from '@netlify/neon'
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
  try {
    const sql = neon()
    return drizzle(sql, { schema })
  } catch (err) {
    throw new DatabaseUnavailableError(err)
  }
}

export type Db = ReturnType<typeof getDb>
export * from './schema'
