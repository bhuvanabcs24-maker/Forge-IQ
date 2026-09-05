import { neon, Pool } from '@neondatabase/serverless';

/**
 * Returns the active Neon PostgreSQL connection string
 */
export function getNeonConnectionString(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    'postgresql://neondb_owner:npg_placeholder@ep-cool-pond-a5xyz.us-east-2.aws.neon.tech/neondb?sslmode=require'
  );
}

/**
 * Serverless SQL Query Client (HTTP-based, ideal for Edge & Serverless API routes)
 */
export function getSql() {
  return neon(getNeonConnectionString());
}

// Default SQL executor instance
export const sql = neon(getNeonConnectionString());

/**
 * Connection Pool for pooled queries
 */
let pool: Pool | null = null;

export function getNeonPool(): Pool {
  const connectionString = getNeonConnectionString();
  if (!pool) {
    pool = new Pool({ connectionString });
  }
  return pool;
}

export interface NeonConnectionStatus {
  connected: boolean;
  databaseName?: string;
  host?: string;
  serverTime?: string;
  version?: string;
  error?: string;
  isMockOrPlaceholder: boolean;
}

/**
 * Tests the live connection to Neon PostgreSQL
 */
export async function testNeonConnection(): Promise<NeonConnectionStatus> {
  const connStr = getNeonConnectionString();
  const isPlaceholder = connStr.includes('npg_placeholder') || connStr.includes('ep-cool-pond');

  try {
    if (isPlaceholder) {
      return {
        connected: false,
        isMockOrPlaceholder: true,
        host: 'ep-cool-pond-a5xyz.us-east-2.aws.neon.tech',
        databaseName: 'neondb',
        error: 'DATABASE_URL is currently using placeholder credentials. Please set your active Neon connection string in .env.local',
      };
    }

    // Connect using serverless client
    const client = neon(connStr);
    const result = await client`SELECT current_database() as db, now() as timestamp, version() as ver;`;

    if (result && result.length > 0) {
      const parsedHost = connStr.match(/@([^:/]+)/)?.[1] || 'neon.tech';
      return {
        connected: true,
        isMockOrPlaceholder: false,
        databaseName: String(result[0].db),
        serverTime: String(result[0].timestamp),
        version: String(result[0].ver).split(' on ')[0],
        host: parsedHost,
      };
    }

    return {
      connected: false,
      isMockOrPlaceholder: false,
      error: 'Query returned empty response from Neon database',
    };
  } catch (err: any) {
    return {
      connected: false,
      isMockOrPlaceholder: isPlaceholder,
      error: err.message || 'Failed to connect to Neon PostgreSQL',
    };
  }
}
