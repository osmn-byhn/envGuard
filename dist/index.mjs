// src/parser.ts
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
function parseEnvFile(filePath) {
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

// src/validator.ts
function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function validateEnv(raw, schema) {
  const result = {};
  for (const key in schema) {
    const rule = schema[key];
    let value = raw[key];
    let optional = false;
    let type;
    let pattern;
    let defaultValue = void 0;
    if (typeof rule === "string") {
      optional = rule.endsWith("?");
      type = rule.replace("?", "");
    } else if (Array.isArray(rule)) {
      type = rule;
    } else {
      type = rule.type;
      optional = rule.required === false || String(rule.type).endsWith("?");
      pattern = rule.pattern;
      defaultValue = rule.default;
    }
    if ((value === void 0 || value === "") && defaultValue !== void 0) {
      value = defaultValue;
    }
    if ((value === void 0 || value === "") && !optional) {
      throw new Error(`[EnvGuard] Missing env variable: ${key}`);
    }
    if (value === void 0 || value === "") continue;
    if (Array.isArray(type)) {
      if (!type.includes(value)) {
        throw new Error(
          `[EnvGuard] Invalid value for ${key}: ${value}, allowed: ${type.join(", ")}`
        );
      }
      result[key] = value;
      continue;
    }
    if (pattern && !pattern.test(value)) {
      throw new Error(`[EnvGuard] ${key} does not match pattern: ${pattern}`);
    }
    switch (type) {
      case "number":
        if (isNaN(Number(value))) {
          throw new Error(`[EnvGuard] ${key} must be a number`);
        }
        result[key] = Number(value);
        break;
      case "boolean":
        result[key] = ["true", "1"].includes(String(value).toLowerCase());
        break;
      case "url":
        if (!isValidUrl(value)) {
          throw new Error(`[EnvGuard] ${key} must be a valid URL`);
        }
        result[key] = value;
        break;
      case "email":
        if (!isValidEmail(value)) {
          throw new Error(`[EnvGuard] ${key} must be a valid email`);
        }
        result[key] = value;
        break;
      case "json":
        try {
          result[key] = JSON.parse(value);
        } catch {
          throw new Error(`[EnvGuard] ${key} must be a valid JSON`);
        }
        break;
      case "array":
        result[key] = value.split(",").map((v) => v.trim());
        break;
      case "date":
        const d = new Date(value);
        if (isNaN(d.getTime())) {
          throw new Error(`[EnvGuard] ${key} must be a valid date`);
        }
        result[key] = d;
        break;
      default:
        result[key] = value;
    }
  }
  return result;
}

// src/exampleGenerator.ts
import fs2 from "fs";
function generateExampleFile(schema) {
  const lines = Object.keys(schema).map((key) => `${key}=`).join("\n");
  fs2.writeFileSync(".env.example", lines);
}

// src/index.ts
import fs3 from "fs";
import path2 from "path";
function loadEnv(schema, options = {}) {
  const { path: envPath = ".env", example = false, strict = false, error } = options;
  const fullPath = path2.resolve(process.cwd(), envPath);
  const envFileExists = fs3.existsSync(fullPath);
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
        get(target, prop) {
          if (prop.includes("SECRET") || prop.includes("TOKEN")) {
            return "[HIDDEN]";
          }
          return target[prop];
        }
      });
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : String(validationError);
      if (error) {
        error(new Error(errorMessage));
      } else {
        throw validationError;
      }
      throw new Error(errorMessage);
    }
  } else {
    try {
      const env = validateEnv({}, schema);
      if (example) generateExampleFile(schema);
      return new Proxy(env, {
        get(target, prop) {
          if (prop.includes("SECRET") || prop.includes("TOKEN")) {
            return "[HIDDEN]";
          }
          return target[prop];
        }
      });
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : String(validationError);
      if (error) {
        error(new Error(errorMessage));
      } else {
        throw validationError;
      }
      throw new Error(errorMessage);
    }
  }
}
export {
  loadEnv
};
