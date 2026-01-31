import fs from "fs";

export function generateExampleFile(schema: Record<string, any>) {
  const lines = Object.keys(schema).map((key) => `${key}=`).join("\n");
  fs.writeFileSync(".env.example", lines);
}
