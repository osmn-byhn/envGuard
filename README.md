# EnvGuard

A type-safe environment variable validation and management library for Node.js. EnvGuard helps you validate, parse, and manage environment variables with a simple schema-based approach.

## Features

- ✅ **Type-safe validation** - Validate environment variables with TypeScript support
- 🔒 **Automatic type conversion** - Numbers, booleans, dates, JSON, arrays, and more
- 🛡️ **Strict validation** - Catch missing or invalid variables at startup
- 📝 **Schema-based** - Define your environment structure with a simple schema
- 🔐 **Security** - Automatic masking of sensitive values (SECRET, TOKEN)
- 📋 **Example generation** - Auto-generate `.env.example` files
- 🎯 **Multiple types** - Support for strings, numbers, booleans, URLs, emails, enums, JSON, arrays, dates, and custom patterns

## Installation

```bash
npm install envguard
```

## Quick Start

```typescript
import { loadEnv } from 'envguard';

const schema = {
  PORT: "number",
  DATABASE_URL: "string",
  DEBUG: "boolean",
};

const env = loadEnv(schema);

console.log(env.PORT); // 3000 (number)
console.log(env.DATABASE_URL); // "postgresql://..." (string)
console.log(env.DEBUG); // true (boolean)
```

## Documentation

### Basic Usage

```typescript
import { loadEnv } from 'envguard';
import { EnvSchema } from 'envguard';

const schema: EnvSchema = {
  PORT: "number",
  DATABASE_URL: "string",
};

const env = loadEnv(schema);
```

### Type System

EnvGuard supports multiple types for environment variable validation:

#### 1. String Type

Basic string validation. Use `"string"` for required strings, or `"string?"` for optional strings.

```typescript
const schema = {
  API_KEY: "string",      // Required
  OPTIONAL_KEY: "string?", // Optional
};

// .env
// API_KEY=my-secret-key
// OPTIONAL_KEY=optional-value (or omit this line)
```

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.API_KEY); // "my-secret-key" (string)
console.log(env.OPTIONAL_KEY); // "optional-value" or undefined
```

#### 2. Number Type

Validates and converts string values to numbers.

```typescript
const schema = {
  PORT: "number",
  TIMEOUT: "number?",
};

// .env
// PORT=3000
// TIMEOUT=5000
```

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.PORT); // 3000 (number, not string)
console.log(typeof env.PORT); // "number"
```

**Error cases:**
- `PORT=abc` → Throws error: `[EnvGuard] PORT must be a number`

#### 3. Boolean Type

Converts string values to boolean. Accepts `"true"`, `"1"` (case-insensitive) as `true`, everything else as `false`.

```typescript
const schema = {
  DEBUG: "boolean",
  ENABLE_FEATURE: "boolean?",
};

// .env
// DEBUG=true
// ENABLE_FEATURE=1
```

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.DEBUG); // true (boolean)
console.log(env.ENABLE_FEATURE); // true (boolean)
```

**Accepted values:**
- `true`, `True`, `TRUE`, `1` → `true`
- `false`, `False`, `FALSE`, `0`, `""`, or any other value → `false`

#### 4. URL Type

Validates that the value is a valid URL.

```typescript
const schema = {
  API_BASE_URL: "url",
  WEBHOOK_URL: "url?",
};

// .env
// API_BASE_URL=https://api.example.com
// WEBHOOK_URL=https://webhook.example.com/callback
```

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.API_BASE_URL); // "https://api.example.com"
```

**Error cases:**
- `API_BASE_URL=not-a-url` → Throws error: `[EnvGuard] API_BASE_URL must be a valid URL`

#### 5. Email Type

Validates that the value is a valid email address.

```typescript
const schema = {
  ADMIN_EMAIL: "email",
  SUPPORT_EMAIL: "email?",
};

// .env
// ADMIN_EMAIL=admin@example.com
// SUPPORT_EMAIL=support@example.com
```

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.ADMIN_EMAIL); // "admin@example.com"
```

**Error cases:**
- `ADMIN_EMAIL=invalid-email` → Throws error: `[EnvGuard] ADMIN_EMAIL must be a valid email`

#### 6. Enum Type

Restricts values to a specific set of allowed strings.

```typescript
const schema = {
  NODE_ENV: ["development", "production", "test"],
  LOG_LEVEL: ["debug", "info", "warn", "error"],
};

// .env
// NODE_ENV=production
// LOG_LEVEL=info
```

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.NODE_ENV); // "production"
console.log(env.LOG_LEVEL); // "info"
```

**Error cases:**
- `NODE_ENV=staging` → Throws error: `[EnvGuard] Invalid value for NODE_ENV: staging, allowed: development, production, test`

#### 7. JSON Type

Parses and validates JSON strings.

```typescript
const schema = {
  CONFIG: "json",
  FEATURE_FLAGS: "json?",
};

// .env
// CONFIG={"timeout":5000,"retries":3}
// FEATURE_FLAGS={"feature1":true,"feature2":false}
```

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.CONFIG); // { timeout: 5000, retries: 3 } (object)
console.log(env.FEATURE_FLAGS); // { feature1: true, feature2: false } (object)
```

**Error cases:**
- `CONFIG={invalid json` → Throws error: `[EnvGuard] CONFIG must be a valid JSON`

#### 8. Array Type

Parses comma-separated values into an array.

```typescript
const schema = {
  ALLOWED_ORIGINS: "array",
  FEATURES: "array?",
};

// .env
// ALLOWED_ORIGINS=http://localhost:3000,https://example.com,https://app.example.com
// FEATURES=feature1,feature2,feature3
```

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.ALLOWED_ORIGINS); // ["http://localhost:3000", "https://example.com", "https://app.example.com"]
console.log(env.FEATURES); // ["feature1", "feature2", "feature3"]
```

**Note:** Values are automatically trimmed of whitespace.

#### 9. Date Type

Parses and validates date strings.

```typescript
const schema = {
  START_DATE: "date",
  END_DATE: "date?",
};

// .env
// START_DATE=2024-01-01
// END_DATE=2024-12-31
```

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.START_DATE); // Date object: 2024-01-01T00:00:00.000Z
console.log(env.START_DATE instanceof Date); // true
```

**Error cases:**
- `START_DATE=invalid-date` → Throws error: `[EnvGuard] START_DATE must be a valid date`

#### 10. Custom Type

Advanced validation with custom patterns, default values, and error handling.

```typescript
const schema = {
  SECRET_TOKEN: {
    type: "string",
    pattern: /^[A-Za-z0-9]{32,}$/,
    description: "32 characters or longer alphanumeric token",
    error: (err) => {
      console.error("Custom error handler:", err.message);
      process.exit(1);
    },
    required: true,
  },
  LOG_LEVEL: {
    type: ["debug", "info", "warn", "error"],
    default: "info",
    description: "Log level",
    error: (err) => console.error(err),
  },
  API_VERSION: {
    type: "string",
    pattern: /^v\d+\.\d+\.\d+$/,
    default: "v1.0.0",
    description: "API version in semver format",
  },
};

// .env
// SECRET_TOKEN=MySuperSecretToken12345678901234567890
// LOG_LEVEL=debug (or omit for default "info")
// API_VERSION=v2.1.0
```

**Custom Type Options:**
- `type`: The base type (string, number, boolean, url, email, json, array, date, or enum array)
- `pattern`: Regular expression for pattern matching
- `default`: Default value if variable is missing or empty
- `description`: Human-readable description
- `error`: Custom error handler function
- `required`: Whether the variable is required (default: `true`)

**Example:**
```typescript
const env = loadEnv(schema);
console.log(env.SECRET_TOKEN); // "MySuperSecretToken12345678901234567890"
console.log(env.LOG_LEVEL); // "debug" or "info" (default)
console.log(env.API_VERSION); // "v2.1.0"
```

**Error cases:**
- `SECRET_TOKEN=short` → Throws error (doesn't match pattern)
- Pattern validation happens before type conversion

### Options

The `loadEnv` function accepts an optional second parameter with configuration options:

```typescript
const env = loadEnv(schema, {
  path: ".env",           // Path to .env file (default: ".env")
  strict: true,          // Warn about unknown variables (default: false)
  example: true,        // Generate .env.example file (default: false)
  error: (err) => {     // Custom error handler
    console.error(err.message);
    process.exit(1);
  },
  debug: true,          // Enable debug mode (default: false)
});
```

#### Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `path` | `string` | `".env"` | Path to the environment file |
| `strict` | `boolean` | `false` | If `true`, warns about variables in `.env` that are not in the schema |
| `example` | `boolean` | `false` | If `true`, generates a `.env.example` file with all schema keys |
| `error` | `(error: Error) => void` | `undefined` | Custom error handler function |
| `debug` | `boolean` | `false` | Enable debug logging |

### Error Handling

EnvGuard throws errors when validation fails. You can handle them with try-catch or use the `error` callback:

```typescript
// Method 1: Try-catch
try {
  const env = loadEnv(schema);
} catch (error) {
  console.error("Validation failed:", error.message);
  process.exit(1);
}

// Method 2: Error callback
const env = loadEnv(schema, {
  error: (err) => {
    console.error("Validation failed:", err.message);
    process.exit(1);
  },
});
```

**Common Errors:**
- `[EnvGuard] Missing env variable: PORT` - Required variable is missing
- `[EnvGuard] PORT must be a number` - Type validation failed
- `[EnvGuard] Invalid value for NODE_ENV: staging, allowed: development, production, test` - Enum validation failed
- `[EnvGuard] Failed to parse .env file at /path/to/.env: ...` - File parsing error

### Security Features

EnvGuard automatically masks sensitive values when accessed through the returned object:

```typescript
const schema = {
  SECRET_TOKEN: "string",
  API_KEY: "string",
  DATABASE_PASSWORD: "string",
};

const env = loadEnv(schema);

// .env
// SECRET_TOKEN=my-secret
// API_KEY=my-key
// DATABASE_PASSWORD=my-password

console.log(env.SECRET_TOKEN); // "[HIDDEN]"
console.log(env.API_KEY); // "[HIDDEN]"
console.log(env.DATABASE_PASSWORD); // "[HIDDEN]"
```

**Note:** Variables containing "SECRET" or "TOKEN" in their names are automatically masked.

### Generating .env.example

You can automatically generate a `.env.example` file:

```typescript
const env = loadEnv(schema, {
  example: true,
});
```

This creates a `.env.example` file with all schema keys (without values):

```env
DATABASE_URL=
PORT=
DEBUG=
API_BASE_URL=
```

### Strict Mode

Enable strict mode to get warnings about unknown variables in your `.env` file:

```typescript
const env = loadEnv(schema, {
  strict: true,
});

// If .env contains variables not in schema:
// [EnvGuard] Unknown env variables: UNKNOWN_VAR, ANOTHER_UNKNOWN
```

## Complete Example

```typescript
import { loadEnv } from 'envguard';
import { EnvSchema } from 'envguard';

const schema: EnvSchema = {
  // Required variables
  DATABASE_URL: "string",
  PORT: "number",
  DEBUG: "boolean",
  API_BASE_URL: "url",
  ADMIN_EMAIL: "email",
  NODE_ENV: ["development", "production", "test"],
  
  // Optional variables
  API_KEY: "string?",
  TIMEOUT: "number?",
  
  // Complex types
  CONFIG: "json",
  ALLOWED_ORIGINS: "array",
  START_DATE: "date",
  
  // Custom validation
  SECRET_TOKEN: {
    type: "string",
    pattern: /^[A-Za-z0-9]{32,}$/,
    required: true,
  },
  LOG_LEVEL: {
    type: ["debug", "info", "warn", "error"],
    default: "info",
  },
};

const env = loadEnv(schema, {
  strict: true,
  example: true,
  error: (err) => {
    console.error("❌ Environment validation failed:", err.message);
    process.exit(1);
  },
});

// Use validated environment variables
console.log(`Server starting on port ${env.PORT}`);
console.log(`Database: ${env.DATABASE_URL}`);
console.log(`Environment: ${env.NODE_ENV}`);
```

## TypeScript Support

EnvGuard is written in TypeScript and provides full type definitions:

```typescript
import { loadEnv, EnvSchema, ParsedEnv } from 'envguard';

const schema: EnvSchema = {
  PORT: "number",
  DATABASE_URL: "string",
};

const env: ParsedEnv = loadEnv(schema);
// env is fully typed!
```

## Best Practices

1. **Define all environment variables in your schema** - This serves as documentation
2. **Use strict mode in production** - Catch unknown variables early
3. **Generate .env.example** - Help other developers know what variables are needed
4. **Use custom types for complex validation** - Patterns, defaults, and custom error handling
5. **Handle errors gracefully** - Use error callbacks or try-catch blocks
6. **Use optional types (`?`)** - For variables that have sensible defaults or are truly optional

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Changelog

### 0.1.0
- Initial release
- Support for all basic types (string, number, boolean, url, email, enum, json, array, date)
- Custom type validation with patterns
- Automatic sensitive value masking
- .env.example generation
- Strict mode for unknown variables
