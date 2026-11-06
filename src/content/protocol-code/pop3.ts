/** POP3 replies start with +OK or -ERR. */
export function parsePop3(line: string) {
  const ok = line.startsWith("+OK");
  return { ok, text: line.replace(/^(\+OK|-ERR)\s*/, "").trimEnd() };
}

/** STAT answers with a message count and total size. */
export function parseStat(line: string): { messages: number; bytes: number } {
  const { ok, text } = parsePop3(line);
  if (!ok) throw new Error(text);
  const [messages, bytes] = text.split(" ").map(Number);
  return { messages, bytes };
}

/** Deletes take effect only at QUIT, so a dropped connection deletes nothing. */
export class Mailbox {
  private marked = new Set<number>();
  private messages: Set<number>;
  constructor(ids: number[]) { this.messages = new Set(ids); }
  dele(id: number): void { if (this.messages.has(id)) this.marked.add(id); }
  rset(): void { this.marked.clear(); }
  quit(): number[] {
    for (const id of this.marked) this.messages.delete(id);
    this.marked.clear();
    return [...this.messages];
  }
}
