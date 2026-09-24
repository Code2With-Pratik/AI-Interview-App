import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const sql = neon(process.env.DATABASE_URL);

const resetDatabase = async () => {
  try {
    console.log("[v0] Dropping existing tables...");

    // Drop tables in reverse order of creation (respecting foreign keys)
    await sql`DROP TABLE IF EXISTS manual_inputs CASCADE`;
    await sql`DROP TABLE IF EXISTS sessions CASCADE`;
    await sql`DROP TABLE IF EXISTS user_answers CASCADE`;
    await sql`DROP TABLE IF EXISTS interview_questions CASCADE`;
    await sql`DROP TABLE IF EXISTS answers CASCADE`;
    await sql`DROP TABLE IF EXISTS questions CASCADE`;
    await sql`DROP TABLE IF EXISTS interviews CASCADE`;
    await sql`DROP TABLE IF EXISTS resumes CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    console.log("[v0] Tables dropped successfully!");
  } catch (error) {
    console.error("[v0] Error dropping tables:", error);
    process.exit(1);
  }
};

resetDatabase();
