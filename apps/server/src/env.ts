/**
 * Must be imported as the very first module in index.ts.
 * Ensures all process.env variables are populated before any service
 * instantiates API clients at module load time.
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
