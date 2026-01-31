import { parseEnvFile } from "./parser";
import { validateEnv } from "./validator";
import { generateExampleFile } from "./exampleGenerator";
import { EnvSchema, EnvGuardOptions } from "./types";
import fs from "fs";
import path from "path";

// Export types for TypeScript users
export type {
  EnvSchema,
  EnvGuardOptions,
  ParsedEnv,
  EnvType,
  PrimitiveType,
  EnumType,
  CustomType,
} from "./types";

export function loadEnv(schema: EnvSchema, options: EnvGuardOptions = {}) {
  const { path: envPath = ".env", example = false, strict = false, error } = options;

  const fullPath = path.resolve(process.cwd(), envPath);
  const envFileExists = fs.existsSync(fullPath);

  // If .env file exists, parse and validate
  // On error, call error callback or throw error
  if (envFileExists) {
    try {
      const raw = parseEnvFile(envPath);
      const env = validateEnv(raw, schema);

      if (example) generateExampleFile(schema);

      if (strict) {
        const extraKeys = Object.keys(raw).filter((k) => !schema[k]);
        if (extraKeys.length) {
          const warning = `[EnvGuard] Unknown env variables: ${extraKeys.join(", ")}`;
          console.warn(warning);
        }
      }

      return new Proxy(env, {
        get(target, prop: string) {
          if (prop.includes("SECRET") || prop.includes("TOKEN")) {
            return "[HIDDEN]";
          }
          return target[prop];
        },
      });
    } catch (validationError) {
      const errorMessage = validationError instanceof Error 
        ? validationError.message 
        : String(validationError);
      
      if (error) {
        error(new Error(errorMessage));
      } else {
        throw validationError;
      }
      
      // Throw error after error callback (if callback didn't exit)
      throw new Error(errorMessage);
    }
  } else {
    // If .env file doesn't exist, only throw error for required variables in schema
    try {
      const env = validateEnv({}, schema);
      
      if (example) generateExampleFile(schema);

      return new Proxy(env, {
        get(target, prop: string) {
          if (prop.includes("SECRET") || prop.includes("TOKEN")) {
            return "[HIDDEN]";
          }
          return target[prop];
        },
      });
    } catch (validationError) {
      const errorMessage = validationError instanceof Error 
        ? validationError.message 
        : String(validationError);
      
      if (error) {
        error(new Error(errorMessage));
      } else {
        throw validationError;
      }
      
      throw new Error(errorMessage);
    }
  }
}
