import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Allow running without database in development mode for demo purposes
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      "DATABASE_URL must be set in production. Did you forget to provision a database?",
    );
  } else {
    console.warn("⚠️  Running in demo mode without database - using localStorage fallback");
  }
}

export const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;
export const db = DATABASE_URL ? drizzle({ client: pool!, schema }) : null;