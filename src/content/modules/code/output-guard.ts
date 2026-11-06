export type Field = { type: "string" | "number" | "boolean"; required?: boolean; oneOf?: string[]; min?: number; max?: number };
export type Schema = Record<string, Field>;

export function validate(value: unknown, schema: Schema): string[] {
  if (typeof value !== "object" || value === null) return ["expected a JSON object"];
  const obj = value as Record<string, unknown>;
  const errors: string[] = [];
  for (const [key, f] of Object.entries(schema)) {
    const v = obj[key];
    if (v === undefined) {
      if (f.required) errors.push(`${key} is required`);
      continue;
    }
    if (typeof v !== f.type) errors.push(`${key} must be a ${f.type}`);
    else if (f.oneOf && !f.oneOf.includes(v as string)) errors.push(`${key} must be one of ${f.oneOf.join(", ")}`);
    else if (typeof v === "number" && ((f.min !== undefined && v < f.min) || (f.max !== undefined && v > f.max))) errors.push(`${key} is out of range`);
  }
  return errors;
}

/** Validate, then re-ask with the exact errors. Never pass unvalidated output downstream. */
export async function guardedCall<T>(prompt: string, llm: (p: string) => Promise<string>, schema: Schema, maxRetries = 2) {
  let ask = prompt;
  let errors: string[] = [];
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const raw = await llm(ask);
    try {
      const parsed = JSON.parse(raw) as T;
      errors = validate(parsed, schema);
      if (errors.length === 0) return { ok: true as const, value: parsed, attempts: attempt };
    } catch {
      errors = ["reply was not valid JSON"];
    }
    ask = `${prompt}\n\nYour last reply failed validation:\n- ${errors.join("\n- ")}\nReply with corrected JSON only.`;
  }
  return { ok: false as const, errors, attempts: maxRetries + 1 };
}
