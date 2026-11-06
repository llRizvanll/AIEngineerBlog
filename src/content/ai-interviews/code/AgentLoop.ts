/* An agent is a loop around a model. Everything that makes it safe sits in this loop, outside the model. */
export type ModelStep = { type: "tool"; tool: string; args: Record<string, string> } | { type: "answer"; text: string };
export type Model = (history: string[]) => Promise<ModelStep>;

export interface Tool {
  name: string;
  /** a write changes the world, so it needs approval and must be safe to retry */
  write: boolean;
  run(args: Record<string, string>, idempotencyKey: string): Promise<string>;
}

export interface AgentLimits {
  maxSteps: number;
  maxRepeats: number;
  approve(tool: string, args: Record<string, string>): Promise<boolean>;
}

export type AgentResult = { status: "answered"; text: string; trace: string[] } | { status: "stopped"; reason: string; trace: string[] };

// region: loop
export async function runAgent(runId: string, model: Model, tools: Tool[], limits: AgentLimits, question: string): Promise<AgentResult> {
  const history = [`user: ${question}`];
  const trace: string[] = [];
  const seen = new Map<string, number>();

  for (let step = 0; step < limits.maxSteps; step++) {
    const next = await model(history);
    if (next.type === "answer") return { status: "answered", text: next.text, trace };

    const call = `${next.tool} ${JSON.stringify(next.args)}`;
    const repeats = (seen.get(call) ?? 0) + 1;
    seen.set(call, repeats);
    if (repeats > limits.maxRepeats) return { status: "stopped", reason: `repeated ${next.tool}`, trace };
    trace.push(call);
    history.push(`assistant: ${call}`);
    history.push(`tool: ${await callTool(runId, next.tool, next.args, tools, limits)}`);
  }
  return { status: "stopped", reason: "step limit", trace };
}
// endregion

// region: tool
/** A failure becomes text the model can read, so it can try another way instead of crashing the run. */
async function callTool(runId: string, name: string, args: Record<string, string>, tools: Tool[], limits: AgentLimits): Promise<string> {
  const tool = tools.find((t) => t.name === name);
  if (!tool) return `error: no tool named ${name}`;
  if (tool.write && !(await limits.approve(name, args))) return "error: a person declined this action";
  const key = `${runId}:${name}:${JSON.stringify(args)}`;
  try {
    return await tool.run(args, key);
  } catch (e) {
    return `error: ${(e as Error).message}`;
  }
}
// endregion
