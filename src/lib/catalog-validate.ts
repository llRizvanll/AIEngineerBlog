import schema from "@/content/portal-asset-schema.json";

/* The subset of JSON Schema that portal-asset-schema.json uses. Runs at build time, so an
   invalid asset fails the build instead of reaching the catalog. */

interface Node {
  type?: string;
  required?: string[];
  properties?: Record<string, Node>;
  additionalProperties?: boolean;
  enum?: string[];
  pattern?: string;
  maxLength?: number;
  minimum?: number;
  items?: Node;
}

function check(value: unknown, node: Node, path: string, errors: string[]): void {
  const fail = (m: string): void => {
    errors.push(`${path}: ${m}`);
  };
  if (node.type === "object") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return fail("must be an object");
    const obj = value as Record<string, unknown>;
    for (const key of node.required ?? []) if (obj[key] === undefined) fail(`missing ${key}`);
    for (const [key, v] of Object.entries(obj)) {
      const child = node.properties?.[key];
      if (child) check(v, child, `${path}.${key}`, errors);
      else if (node.additionalProperties === false && v !== undefined) fail(`unknown property ${key}`);
    }
    return;
  }
  if (node.type === "array") {
    if (!Array.isArray(value)) return fail("must be an array");
    value.forEach((v, i) => node.items && check(v, node.items, `${path}[${i}]`, errors));
    return;
  }
  if (node.type === "integer") {
    if (!Number.isInteger(value)) return fail("must be an integer");
    if (node.minimum !== undefined && (value as number) < node.minimum) fail(`must be at least ${node.minimum}`);
    return;
  }
  if (node.type === "string") {
    if (typeof value !== "string") return fail("must be a string");
    if (node.enum && !node.enum.includes(value)) fail(`"${value}" is not an allowed value`);
    if (node.pattern && !new RegExp(node.pattern).test(value)) fail(`"${value}" does not match ${node.pattern}`);
    if (node.maxLength !== undefined && value.length > node.maxLength) fail(`longer than ${node.maxLength}`);
  }
}

/** Returns every problem found; an empty list means all assets are valid. */
export function validateAssets(assets: unknown[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  assets.forEach((a, i) => {
    const id = (a as { assetId?: string }).assetId ?? `#${i}`;
    if (seen.has(id)) errors.push(`${id}: duplicate assetId`);
    seen.add(id);
    check(a, schema as Node, id, errors);
  });
  return errors;
}
