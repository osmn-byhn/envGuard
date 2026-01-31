export type PrimitiveType =
  | "string"
  | "number"
  | "boolean"
  | "url"
  | "email"
  | "json"
  | "date"
  | "array"
  | `${string}?`;

export type EnumType = string[];

export type CustomType = {
  type: PrimitiveType | EnumType;
  pattern?: RegExp;
  default?: any;
  description?: string;
  error: (error: Error) => void;
  required?: boolean;
};

export type EnvType = PrimitiveType | EnumType | CustomType;

export type EnvSchema = Record<string, EnvType>;

export interface EnvGuardOptions {
  path?: string;
  strict?: boolean;
  example?: boolean;
  maskSensitive?: boolean;
  defaults?: boolean;
  error?: (error: Error) => void;
  debug?: boolean;
}

export type ParsedEnv = Record<
  string,
  string | number | boolean | object | Date | string[]
>;
