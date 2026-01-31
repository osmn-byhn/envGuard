import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export function parseEnvFile(filePath: string) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return {};
  
  try {
    const content = fs.readFileSync(fullPath, "utf-8");
    return dotenv.parse(content);
  } catch (error) {
    throw new Error(
      `[EnvGuard] Failed to parse .env file at ${fullPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
