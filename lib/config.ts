// Configuration validation
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

export function validateConfig() {
  const required = {
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  }
  console.log('database url ', process.env.DATABASE_URL)
  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.warn(`[Config] Missing environment variables: ${missing.join(', ')}`)
    console.warn('[Config] Please set these in your .env.local file')
  }

  return {
    isValid: missing.length === 0,
    missing,
  }
}

// For client-side checks (non-sensitive vars only)
export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
}
