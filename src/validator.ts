import { EnvSchema, ParsedEnv, CustomType } from "./types";

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateEnv(
  raw: Record<string, any>,
  schema: EnvSchema,
): ParsedEnv {
  const result: ParsedEnv = {};

  for (const key in schema) {
    const rule = schema[key];
    let value = raw[key];

    // Determine optional / default / type info
    let optional = false;
    let type: string | string[] | undefined;
    let pattern: RegExp | undefined;
    let defaultValue: any = undefined;

    if (typeof rule === "string") {
      optional = rule.endsWith("?");
      type = rule.replace("?", "");
    } else if (Array.isArray(rule)) {
      type = rule; // Enum
    } else {
      // CustomType
      type = rule.type;
      optional = rule.required === false || String(rule.type).endsWith("?");
      pattern = (rule as CustomType).pattern;
      defaultValue = (rule as CustomType).default;
    }

    // Apply default value if undefined
    if ((value === undefined || value === "") && defaultValue !== undefined) {
      value = defaultValue;
    }

    // Missing required variable
    if ((value === undefined || value === "") && !optional) {
      throw new Error(`[EnvGuard] Missing env variable: ${key}`);
    }

    // Skip optional empty values
    if (value === undefined || value === "") continue;

    // Enum check
    if (Array.isArray(type)) {
      if (!type.includes(value)) {
        throw new Error(
          `[EnvGuard] Invalid value for ${key}: ${value}, allowed: ${type.join(", ")}`,
        );
      }
      result[key] = value;
      continue;
    }

    // Pattern regex check
    if (pattern && !pattern.test(value)) {
      throw new Error(`[EnvGuard] ${key} does not match pattern: ${pattern}`);
    }

    // Type parsing
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
        result[key] = value.split(",").map((v: string) => v.trim());
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
