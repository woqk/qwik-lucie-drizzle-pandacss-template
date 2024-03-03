import * as schema from './schema';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const queryClient = postgres({
    user: "root_user",
    password: "S3cret",
    host: "localhost:5432",
    port: 5432,
    database: "root_db",
});

export const db: PostgresJsDatabase<typeof schema> = drizzle(queryClient, { schema });
