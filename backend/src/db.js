import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  ssl: {
    rejectUnauthorized: false,
  },
  // host: process.env.DB_HOST || "localhost",
  // port: process.env.DB_PORT || 5432,
  // user: process.env.DB_USER || "postgres",
  // password: process.env.DB_PASSWORD || "123456789",
  // database: process.env.DB_NAME || "support_inbox",
});
