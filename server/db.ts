import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Allow running without database for demo purposes
const DATABASE_URL = process.env.DATABASE_URL;
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !DATABASE_URL;

if (!DATABASE_URL) {
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true') {
    console.warn("⚠️  No DATABASE_URL provided - running in DEMO MODE");
    console.warn("⚠️  Set DEMO_MODE=true environment variable to acknowledge demo mode");
    console.warn("⚠️  Or add a PostgreSQL database for full functionality");
  }
  console.warn("🚀 Running in demo mode without database - using in-memory storage");
}

export const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;
export const db = DATABASE_URL ? drizzle({ client: pool!, schema }) : null;