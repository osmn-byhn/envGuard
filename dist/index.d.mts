type PrimitiveType = "string" | "number" | "boolean" | "url" | "email" | "json" | "date" | "array" | `${string}?`;
type EnumType = string[];
type CustomType = {
    type: PrimitiveType | EnumType;
    pattern?: RegExp;
    default?: any;
    description?: string;
    error: (error: Error) => void;
    required?: boolean;
};
type EnvType = PrimitiveType | EnumType | CustomType;
type EnvSchema = Record<string, EnvType>;
interface EnvGuardOptions {
    path?: string;
    strict?: boolean;
    example?: boolean;
    maskSensitive?: boolean;
    defaults?: boolean;
    error?: (error: Error) => void;
    debug?: boolean;
}
type ParsedEnv = Record<string, string | number | boolean | object | Date | string[]>;

declare function loadEnv(schema: EnvSchema, options?: EnvGuardOptions): ParsedEnv;

export { type CustomType, type EnumType, type EnvGuardOptions, type EnvSchema, type EnvType, type ParsedEnv, type PrimitiveType, loadEnv };
