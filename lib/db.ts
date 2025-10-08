import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// For development, you can use Supabase's connection string
// For production, use connection pooling
const connectionString = process.env.DATABASE_URL!;

// Create the connection
const client = postgres(connectionString);

// Create the Drizzle instance with schema
export const db = drizzle(client, { schema });
